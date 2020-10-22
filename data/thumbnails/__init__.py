"""
mesh renderer
- pvMeshRenderer is a class that works on all platforms, a nice wrapper around vtkRenderer
- vtkMeshRenderer is a class that works on all platforms
- generate_image_from_vertices_and_faces only works on Linux; it's used by process data scripts
"""

# shortcuts (with standardized names used for dSpaceX model evaluation
from .vtk_mesh_renderer import vtkMeshRenderer as MeshRenderer
#from .pyvista_mesh_renderer import pvMeshRenderer as MeshRenderer
