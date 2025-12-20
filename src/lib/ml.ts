import * as tf from '@tensorflow/tfjs';
import Papa from 'papaparse';

// Define types for our ML pipeline
export interface DataPoint {
  [key: string]: number | string;
}

export interface TrainingResult {
  model: tf.LayersModel;
  history: tf.History;
  loss: number;
}

/**
 * ML Service for Client-Side Anomaly Detection
 * Uses TensorFlow.js to train an Autoencoder on the browser
 */
export class MLEngine {
  private model: tf.LayersModel | null = null;
  private normalizationData: { min: tf.Tensor; max: tf.Tensor } | null = null;

  /**
   * Parse CSV File
   */
  async parseCSV(file: File): Promise<DataPoint[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data as DataPoint[]);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

  /**
   * Preprocess data: Filter numerics and normalize
   */
  preprocess(data: DataPoint[]): tf.Tensor2D {
    // Extract numeric columns only
    const numericKeys = Object.keys(data[0]).filter(key => 
      typeof data[0][key] === 'number'
    );

    const values = data.map(row => 
      numericKeys.map(key => (row[key] as number) || 0)
    );

    const tensor = tf.tensor2d(values);
    
    // Min-Max Normalization
    const min = tensor.min(0);
    const max = tensor.max(0);
    this.normalizationData = { min, max };

    // Normalize to 0-1 range
    return tensor.sub(min).div(max.sub(min).add(1e-6)); // add epsilon to avoid div by zero
  }

  /**
   * Create and Train an Autoencoder Model
   */
  async trainModel(dataTensor: tf.Tensor2D): Promise<TrainingResult> {
    const inputShape = [dataTensor.shape[1]];
    
    // Simple Autoencoder Architecture
    const model = tf.sequential();
    
    // Encoder: Compresses data
    model.add(tf.layers.dense({ 
      units: Math.max(2, Math.floor(inputShape[0] / 2)), 
      activation: 'relu', 
      inputShape: inputShape 
    }));
    
    // Decoder: Reconstructs data
    model.add(tf.layers.dense({ 
      units: inputShape[0], 
      activation: 'sigmoid' 
    }));

    model.compile({
      optimizer: 'adam',
      loss: 'meanSquaredError'
    });

    // Train the model to reconstruct its own input
    const history = await model.fit(dataTensor, dataTensor, {
      epochs: 50,
      batchSize: 32,
      shuffle: true,
      verbose: 0
    });

    this.model = model;
    const loss = history.history.loss[history.history.loss.length - 1] as number;

    return { model, history, loss };
  }

  /**
   * Detect Anomalies (Inference)
   * Returns reconstruction error (higher error = more likely anomaly)
   */
  detectAnomalies(dataTensor: tf.Tensor2D): number[] {
    if (!this.model) throw new Error("Model not trained");

    return tf.tidy(() => {
      const prediction = this.model!.predict(dataTensor) as tf.Tensor;
      // Calculate Mean Squared Error between Input and Reconstruction
      const mse = tf.sub(dataTensor, prediction).square().mean(1);
      return Array.from(mse.dataSync());
    });
  }
}

export const mlEngine = new MLEngine();
