# Reactive Robots: ROS2 & Webots 

> **Project**
> <br />
> Course Unit: [Topics in Intelligent Robotics](https://sigarra.up.pt/feup/en/ucurr_geral.ficha_uc_view?pv_ocorrencia_id=542590), 2024/2025
> <br />
> Faculty: **FEUP** (University of Porto)
> <br />
> [**View Full Report**](./Article.pdf)
> <br />

---

## Project Overview

This project explores the implementation of **purely reactive autonomous navigation** in simulation. 

- **Reactive Control:** Navigation based solely on real-time stimuli without memory-based mapping.
- **Sensor Fusion:** Comparison between proximity-based navigation and LiDAR-enhanced obstacle/target differentiation.
- **Dynamic Interaction:** Implementation of a leader-follower behavior where the follower prioritizes tracking the leading robot over wall-following.

## Technical Approach

### 1. Architectural Evolution
We developed two distinct control strategies to evaluate the trade-off between minimalist design and robust perception:
*   **Baseline Architecture:** Utilizes only proximity sensors. This approach proved efficient but struggled with differentiation between the wall and other robots, leading to "trapped" states in high-curvature areas.
*   **Improved Architecture:** Integrates a **LiDAR sensor** on the follower robot, combined with a **RANSAC-based circle-fitting algorithm**. This allows the robot to distinguish between flat wall segments and the circular chassis of the other robot, enabling adaptive following behaviors.

![Architecture Flow](docs/figure1.png)
![Baseline vs Improved](docs/figure2.png)

### 2. Robot Detection & Perception
The follower robot processes raw point cloud data from the LiDAR to compute the relative position of the leading robot.
*   **Clustering:** Points are grouped by proximity to identify continuous objects.
*   **RANSAC Implementation:** We applied circle-fitting to identify the leading robot’s geometry. An instance is confirmed only if it matches the physical radius (~0.045m) of the target.
*   **Adaptive Speed:** The follower dynamically adjusts its velocity, halting when the distance falls below a critical threshold to avoid collisions.


<div align="center">
  <img src="docs/baseline_gif.gif" alt="Lidar Gif" width="500"/>
  <img src="docs/lidar_gif.gif" alt="Lidar Gif" width="500"/>
</div>

### 3. Performance Results
We benchmarked the systems using "Loop Time" in a structured obstacle environment. The advanced approach significantly reduced collision-induced stalls, resulting in more fluid navigation:

| Architecture | Navigation Reliability | Key Observation |
| :--- | :--- | :--- |
| **Baseline** | Low | Frequent collisions in confined, sharp-edged segments. |
| **Improved** | **High** | Consistent wall parallelism and dynamic collision avoidance. |

## Running the Simulation

**Requirements:**
- Ubuntu with ROS2 (Humble or newer recommended)
- Webots (R2025a)
- `webots_ros2` package

**Setup & Execution:**
```bash
# 1. Build the package
colcon build --packages-select firstrobot_webots
source install/setup.bash

# 2. Launch the Webots environment
ros2 launch firstrobot_webots robot_launch.py
```

## Tech Stack
**ROS2**, **Webots**, **C++17**, **RANSAC**, **LiDAR/Proximity Sensing**

## Team
- **Adriano Machado** (up202105352)
- **Félix Martins** (up202108837)
- **Francisco da Ana** (up202108762)
- **Martim Iglesias** (up202005380)
