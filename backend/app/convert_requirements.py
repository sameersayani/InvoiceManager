import re
from pathlib import Path

def convert_requirements_to_pyproject():
    # Read requirements.txt
    requirements_path = Path("requirements.txt")
    if not requirements_path.exists():
        print("requirements.txt not found!")
        return
    
    with open(requirements_path, 'r', encoding='utf-8') as f:
        requirements = f.readlines()
    
    # Parse packages
    packages = []
    for line in requirements:
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        
        # Match package==version
        match = re.match(r'^([a-zA-Z0-9_-]+)==([0-9.]+)$', line)
        if match:
            packages.append((match.group(1), match.group(2)))
            continue
        
        # Match package[extra]==version
        match = re.match(r'^([a-zA-Z0-9_-]+)\[([a-zA-Z0-9_-]+)\]==([0-9.]+)$', line)
        if match:
            packages.append((match.group(1), match.group(3), match.group(2)))
    
    # Generate pyproject.toml content
    pyproject_content = '''[tool.poetry]
name = "fastapi-invoice-app"
version = "0.1.0"
description = "FastAPI Invoice Management Application"
authors = ["Your Name <you@example.com>"]
packages = []

[tool.poetry.dependencies]
python = "^3.8"

'''
    
    # Add packages
    for pkg_info in packages:
        if len(pkg_info) == 2:
            package, version = pkg_info
            pyproject_content += f'{package} = "^{version}"\n'
        else:
            package, version, extra = pkg_info
            pyproject_content += f'{package} = {{ extras = ["{extra}"], version = "^{version}" }}\n'
    
    pyproject_content += '''
[tool.poetry.group.dev.dependencies]
pytest = "^7.4.3"
pytest-asyncio = "^0.21.1"

[build-system]
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"
'''
    
    # Write pyproject.toml
    with open('pyproject.toml', 'w', encoding='utf-8') as f:
        f.write(pyproject_content)
    
    print("pyproject.toml created successfully!")
    print(f"Added {len(packages)} packages from requirements.txt")

if __name__ == "__main__":
    convert_requirements_to_pyproject()
