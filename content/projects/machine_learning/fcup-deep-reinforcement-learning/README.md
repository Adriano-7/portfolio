# Deepfake Detection and Image Generation

> **Project**
> <br />
> Course Unit: [Deep and Reinforcement Learning 2024/2025](https://sigarra.up.pt/feup/pt/ucurr_geral.ficha_uc_view?pv_ocorrencia_id=542587), 4th year
> <br />
> Course: **M.IA** (Masters in Artificial Intelligence)
> <br />
> Faculty: **FEUP/FCUP** (University of Porto)
> <br />
> Report: [View Project Report](./report.pdf)
> <br />
> Project evaluation: **19**/20

---

## Project Overview

This project explores **Deepfake Detection** and **Generative Modeling** using the *DeepFakeFace (DFF)* dataset — a collection of 120,000 facial images spanning real photographs and AI-generated fakes produced by three distinct diffusion-based pipelines.

- **Detection:** Benchmarked pre-trained transfer learning architectures (ResNet, EfficientNet, DenseNet, ViT) and developed high-performance custom CNNs from scratch.
- **Generation:** Implemented Generative Adversarial Networks (MLP-GAN and DCGAN) and Denoising Diffusion Probabilistic Models (DDPM) to analyze and replicate the dataset's distribution.

## Technical Approach

### 1. Classification — Deepfake Detection

To address the dataset's inherent **3:1 class imbalance** (90k fake vs. 30k real images), we applied **undersampling**, keeping 10k fake images per generative method to ensure balanced training.

**Transfer Learning** models were fine-tuned by replacing their final classification heads with custom binary output layers, evaluated across architectures with very different computational footprints:

| Model | Test Accuracy | Key Insight |
| :--- | :--- | :--- |
| **EfficientNet_B0** | **99.55%** | Best overall — rapid convergence within 10 epochs with Adam (LR=0.001, BS=32). |
| **DenseNet161** | 98.85% | Exceptional feature reuse via dense skip connections. |
| **ResNet50** | 98.70% | Adam consistently outperformed SGD across all ResNet variants. |
| **ViT_b_16** | 93.74% | Required careful LR reduction (0.01%) due to large parameter space and small batch size. |
| **ViT_b_32** | 87.82% | Larger patches hurt fine-grained feature capture; needed LR as low as 0.0001%. |

**Custom CNNs** were designed and trained entirely from scratch:

- **Baseline CNN** — 3 convolutional blocks with ReLU and max pooling, achieving **71.70%** accuracy after 150 epochs. Analysis revealed the model's confidence degraded over time without signs of hard overfitting — an interesting divergence between loss and accuracy dynamics.
- **Improved CNN** — 4 convolutional blocks augmented with **Batch Normalization** and a deeper MLP head with Dropout, achieving **98.35%** accuracy (99.03% with a sigmoid output variant) — rivaling the pre-trained models entirely without ImageNet weights.

![alt text](figures/classifier_performance.png)

### 2. Generative Modeling

We progressively explored three generative architectures, each overcoming limitations of the previous.

**MLP-GAN** served as the baseline. Both generator and discriminator were pure MLP networks trained for 1500 epochs (Adam, LR=0.0002, BCE loss, BS=512). The training dynamics showed a characteristic volatility → equilibrium → divergence pattern: by epoch 800 the discriminator gained a decisive advantage, and generated images degraded from blurry-but-coherent faces into high-saturation noise.

**DCGAN** replaced fully-connected layers with transposed convolutions (generator) and strided convolutions (discriminator), following the original DCGAN paper's weight initialization scheme (N(0, 0.02)). Two variants were trained for up to 1500 epochs — one with ReLU and one with LeakyReLU in the generator. The convolutional structure produced markedly clearer spatial face-like structures, though limited by 64×64 resolution.

<div align="center">
    <img src="figures/output.gif" alt="MLP-GAN" width="600"/>
    <p><em>Figure: GIF animation showcasing the MLP-GAN generated images at different epochs</em></p>
</div>


**Diffusion Models (DDPM)** were explored in two stages:
- A **custom U-Net** (5 encoder/decoder blocks, 64→1024 channels, sinusoidal time embeddings) with T=300 timesteps and L1 loss, trained for 900 epochs at 64×64. Results showed diverse face structures but desaturated coloring.
- A **Hugging Face `diffusers`-based UNet2DModel** at 128×128 resolution (1000 timesteps, DDPMScheduler with `squaredcos_cap_v2` schedule, AdamW with cosine warmup). Even after just 30 epochs, the output exhibited substantially more vibrant colors and structural coherence — though at a steep computational cost (~10 hours per 30 epochs).


## Results Summary

Among all generative approaches, the **diffusers-based DDPM** showed the most promise for quality and diversity. Among classifiers, **EfficientNet_B0** led the field, while the custom **Improved CNN** proved that strong deepfake detection is achievable without pre-training.

## Running the Code

**1. Environment Setup:**
```bash
conda create -n deep python=3.9
conda activate deep
conda install pytorch torchvision -c pytorch
pip install transformers diffusers scikit-learn matplotlib seaborn tqdm
```

**2. Data Pipeline:**
Ensure the `/data` directory is populated with the DFF dataset, then run:
```bash
cd utils
python move_images.py
python balance_split.py --samples 10000
```

**3. Classification Training:**
```bash
python scripts/classification/script_classifier.py
```

**4. Generative Model Training:**
```bash
# DCGAN
python scripts/generative/dcgan.py

# Diffusion Model
python scripts/generative/diffusion2.py
```

**5. Analysis Notebook:**

The full experimental pipeline, comparisons, and visualizations are available in:
```bash
jupyter notebook notebook.ipynb
```

## Tech Stack

**Core:** Python, PyTorch, Torchvision
**Generative:** Hugging Face Diffusers
**Analysis & Visualization:** Scikit-learn, Matplotlib, Seaborn, Pandas, Tqdm

## Team

- **Adriano Machado** (up202105352)
- **Francisco da Ana** (up202108762)
- **Tomás Vicente** (up202108717)

