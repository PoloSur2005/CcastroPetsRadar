# versions.tf
# ------------------------------------------------------------------------------
# Fija (pinnea) las versiones de Terraform y de los providers que usa este
# proyecto. Sirve para que cualquiera que clone el repo obtenga exactamente las
# mismas versiones -> infraestructura reproducible y sin sorpresas por cambios
# incompatibles entre versiones.
# ------------------------------------------------------------------------------

terraform {
  # Versión mínima del CLI de Terraform requerida.
  required_version = ">= 1.5.0"

  required_providers {
    # Provider oficial de DigitalOcean publicado en el Terraform Registry.
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0" # cualquier 2.x; no salta a 3.x automáticamente
    }
  }
}
