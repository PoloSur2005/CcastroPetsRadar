# providers.tf
# ------------------------------------------------------------------------------
# Configura el provider de DigitalOcean: es el "driver" que traduce los recursos
# que declaramos (droplet, firewall, ssh key...) en llamadas a la API de DO.
# El token NUNCA se escribe aquí en texto plano: se inyecta por la variable
# var.do_token (definida en terraform.tfvars, que está en .gitignore).
# ------------------------------------------------------------------------------

provider "digitalocean" {
  token = var.do_token
}
