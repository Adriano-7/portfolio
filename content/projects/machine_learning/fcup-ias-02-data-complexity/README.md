
# Data Complexity and Meta-Learning: Wine Dataset Analysis

> **Project**
> <br />
> Course Unit: [Inteligência Artificial e Sociedade](https://sigarra.up.pt/feup/pt/ucurr_geral.ficha_uc_view?pv_ocorrencia_id=542585), 4th year
> <br />
> Course: **M.IA** (Masters in Artificial Intelligence)
> <br />
> Faculty: **FCUP/FEUP** (University of Porto)
> <br />
> Report: [Exploring Data Complexity on the Wine Dataset](./report.pdf)
> <br />
> Project evaluation: **18**/20


---

## Project Goals

The objective of this study was to analyze the data complexity of the Scikit-learn **Wine dataset** using meta-learning techniques. By quantifying the intrinsic difficulty of the dataset, we aimed to predict and explain the performance of different classification paradigms: **Decision Trees**, **K-Nearest Neighbors (KNN)**, and **Support Vector Machines (SVM)**.

- **Complexity Profiling:** Calculating measures across overlapping, linearity, neighborhood, network, dimensionality, and class balance categories.
- **Instance Hardness:** Visualizing the distribution of "hard-to-classify" instances using PCA and kDN (k-Disagreeing Neighbors).
- **Model Validation:** Correlating the theoretical complexity findings with actual performance metrics after hyperparameter tuning.

## Technical Approach

### 1. Data Complexity Analysis
Using the `problexity` and `pymfe` libraries, we extracted a comprehensive set of meta-features based on the work of Garcia et al. (2018).

*   **Linearity & Overlap:** The dataset showed near-zero values for $L1, L2, L3$ and low $F1-F4$ scores, indicating that the classes are almost perfectly linearly separable with minimal feature overlap.
*   **Neighborhood Structure:** A low $N1$ (0.02) confirmed very few borderline points, suggesting smooth decision boundaries. However, a high $LSC$ (0.69) indicated dense clusters within classes.
*   **Network Topology:** A high density (0.91) revealed sparse connectivity between instances, which provided a theoretical hint that distance-based models might face slight challenges compared to global linear models.

![Complexity Measures](docs/complexity_measures.png)

### 2. Instance Hardness Visualization
We employed the `pyhard` library to perform **Principal Component Analysis (PCA)**. 
*   **Hardness Mapping:** Each instance was colored based on its $kDN$ score. 
*   **Observations:** While the majority of the dataset is "easy" (blue), the harder instances (red) are localized specifically at the cluster boundaries and overlap regions between the three wine origins.

![PCA Analysis](docs/pca.png) 

### 3. Classifier Evaluation & Comparison
To validate the complexity analysis, we trained three classifiers using `GridSearchCV` for optimal parameter selection.

| Model | Accuracy | Precision | Key Insight |
| :--- | :--- | :--- | :--- |
| **SVM** | **0.981** | **0.983** | Best performer; perfectly matched the "Linear Separability" finding. |
| **KNN** | 0.963 | 0.965 | Strong performance due to clear clusters, though slightly limited by network sparsity. |
| **Decision Tree** | 0.944 | 0.951 | Third place; likely limited by potential overfitting on the specific high-variance features (high T4 value). |

## Running the code

**Setup:**
```bash
conda create -n wine-complexity python=3.9
conda activate wine-complexity
pip install pyhard problexity pymfe scikit-learn pandas matplotlib
```

**Run Analysis:**
You can explore the full analysis, including the complexity plots and model training, in the Jupyter Notebook:
```bash
jupyter notebook T02_Assignment_Notebook.ipynb
```

## Tech Stack

Python, Scikit-learn, Problexity, Pyhard, Pymfe, Pandas, Matplotlib

## Team

- **Adriano Machado** (up202105352)