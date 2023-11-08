
# watercycle

Watercycle is developing an open-source, low-cost water structuring device to improve crop yields and accelerate natural carbon sequestration.

We're just getting started and more documentation is coming soon.

If you would like to get involved, please reach out!

## Tools
###  Spiral Generator --  `spiral_generator.mjs`

 - Generate mesh geometries to be imported into 3D modeling software and used to design water structuring devices.
 - Outputs an `.stl` file describing a spiral geometry, namely a set of [X,Y,Z] coordinate vertices sampled along a parametric curve. Each vertex is connected to its neighbors and a single vertex at the origin, [0,0,0].

**To run :**
`npm i`
`node spiral_generator.mjs`

 The parametric curve generator function `phiSpiral` can be modified to generate different spiral patterns.

### More Coming Soon ...
