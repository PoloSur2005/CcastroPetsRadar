# outputs.tf
# ------------------------------------------------------------------------------
# Valores que Terraform imprime tras "apply". Sirven para conectarse y probar el
# despliegue sin tener que buscar la IP en el panel de DigitalOcean.
# ------------------------------------------------------------------------------

output "droplet_ip" {
  description = "IP pública del droplet."
  value       = digitalocean_droplet.api.ipv4_address
}

output "api_url" {
  description = "URL pública de la API."
  value       = "http://${digitalocean_droplet.api.ipv4_address}:${var.app_port}"
}

output "ssh_command" {
  description = "Comando para entrar al droplet por SSH."
  value       = "ssh -i ${replace(var.ssh_pub_key_path, ".pub", "")} root@${digitalocean_droplet.api.ipv4_address}"
}
