# Missing Data Mechanisms and Imputation Strategies: Iris & Wine Analysis

> **Individual Assignment 4**
> <br />
> Course Unit: [Inteligência Artificial e Sociedade](https://sigarra.up.pt/feup/pt/ucurr_geral.ficha_uc_view?pv_ocorrencia_id=542585), 4th year
> <br />
> Course: **M.IA** (Masters in Artificial Intelligence)
> <br />
> Faculty: **FCUP/FEUP** (University of Porto)
> <br />
> Report: [Individual Assignment 4: Missing Data](./report.pdf)
> <br />
> Project evaluation: **19**/20

---

## Project Goals

The objective of this assignment was to explore how different missing data mechanisms impact the performance of predictive models and to evaluate the effectiveness of various imputation strategies. Using the **Iris** and **Wine** datasets, we simulated data loss and compared mitigation techniques across multiple dimensions of accuracy.

- **Mechanism Analysis:** Simulating and visualizing **MCAR** (Completely At Random), **MAR** (At Random), and **MNAR** (Not At Random) patterns.
- **Imputation Benchmarking:** Comparing five distinct methods: **Case Deletion**, **Mean Imputation**, **MICE** (Multivariate Imputation by Chained Equations), **KNN Imputation**, and **SoftImpute**.
- **Multi-Metric Evaluation:** Assessing performance through Predictive Accuracy (**PAC/MSE**), Distributional Accuracy (**DAC/KS Distance**), and Classification Error (**CE/F1-Score**).

## Technical Approach

### 1. Simulating Missingness
Using the `mdatagen` library, missing values were introduced into the datasets to replicate real-world scenarios:
*   **MCAR:** Data is missing purely by chance.
*   **MAR:** Missingness is correlated with observed features (e.g., petal-width correlated with petal-length).
*   **MNAR:** The most complex scenario, where missingness depends on the unobserved value itself.

We used the `missingno` package to visualize these patterns, confirming that MAR and MNAR introduce significant feature correlations in the missingness matrix.

![Missingness Patterns](docs/missing_patterns.png) 

### 2. Evaluation Framework
To ensure a fair comparison, a **Random Forest** classifier was optimized for each complete dataset using `GridSearchCV`. These "optimal" models were then frozen and used to evaluate the quality of different imputation methods.

*   **Predictive Accuracy (PAC):** Measured via Mean Squared Error (MSE) to see how closely imputed values match original ones.
*   **Distributional Accuracy (DAC):** Measured via the Kolmogorov-Smirnov (KS) Distance to check if the statistical distribution of features was preserved.
*   **Classification Performance:** Measured via F1-Score (Macro) to see the impact on the final downstream task.

| Method | Best For... | Limitation |
| :--- | :--- | :--- |
| **SoftImpute** | Predictive Accuracy (PAC) | Computationally heavier than mean. |
| **MICE** | Distributional Stability | Convergence issues on small samples. |
| **KNN** | MCAR/MAR Scenarios | Struggles significantly under MNAR. |
| **Case Deletion** | MCAR (Simple) | High data loss; fails on MAR/MNAR. |

## Running the code

**Setup:**
```bash
conda create -n missing-data python=3.9
conda activate missing-data
pip install scikit-learn pandas matplotlib missingno mdatagen fancyimpute scipy
```

**Run Analysis:**
The analysis is contained within the Jupyter Notebook. You can run it to reproduce the simulations and plots:
```bash
jupyter notebook IA04_Missing_Data.ipynb
```

## Tech Stack

Python, Scikit-learn, Mdatagen, Missingno, Fancyimpute, Pandas, Matplotlib, SciPy

## Team

- **Adriano Machado** (up202105352)