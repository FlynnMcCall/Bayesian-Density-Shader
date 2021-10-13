# Bayesian-Density-Shader
This is a fragment shader which presents the probability density that any given pixel is the centre of a gaussian bump, given a sample of 2d vectors.

Uses: This algorithm can be used to find possible centres of a series of data points and show the relative probability densities.

# Visuals:
All colours, points and point sizes can be easily modified in code.
The size, standard deviation, and range of outputs for the resultant density function are all controlled by intuitive variables in the code.

# Thorough explanation: 
This shader takes in a series of vector2 inputs. Each thread will calculate the distance to each point. The thread assumes that the distance to the points were selected randomly using a gaussian distribution centred on distance = 0. The thread calculates the probability that the distances given were sampled. The pixel is given an colour based on the probability calculated.

# Limitations:
The probability densities are not numerical. Whilst the heatmap shows the relative probabilities of different points, it cannot show the absolute probabilities.
It exclusively works for gaussian bumps. I tried to implement a system to allow the algorithm to assume that the distances were sampled from an offset curve, but the computer seem to didn't agree that it was a good idea.
The variables are unclear. I tried to add as many clarifying comments as I could, but the project was designed by me for me, using an in-browser fragment shader, so all the variables need to be manually set. If you use this and find it unclear, let me know and I'll spend more time on this project.

# Future Goals (?):
add compatibility for alternate probability functions
add settings to account for outliers
add some system that accounts for probability functions with rotational asymmetry

# Notes: 
The rendered density is automatically set to "terraced", each layer has a probability density an order of magnitude different to the adjacent layers 
This is my first project, sorry for the dubious code To be honest I don't actually know if this is Bayesian
Ok, good luck
