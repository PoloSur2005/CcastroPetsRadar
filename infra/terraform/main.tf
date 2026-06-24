# main.tf
# ------------------------------------------------------------------------------
# Define los recursos reales que se crean en DigitalOcean:
#   1. La llave SSH (para poder entrar al servidor).
#   2. El droplet (la máquina virtual Debian que corre la app vía docker compose).
#   3. El firewall (deja entrar solo SSH y el puerto de la API; bloquea DB/Redis).
# ------------------------------------------------------------------------------

# 1) Sube tu llave SSH pública a DigitalOcean. El droplet la usará para permitir
#    el acceso por SSH sin contraseña.
resource "digitalocean_ssh_key" "deploy" {
  name       = var.ssh_key_name
  public_key = file(pathexpand(var.ssh_pub_key_path))
}

# 2) El droplet: la VM donde se clona el repo y se levantan los contenedores.
#    user_data = script cloud-init que se ejecuta en el PRIMER arranque.
resource "digitalocean_droplet" "api" {
  name     = var.droplet_name
  region   = var.region
  size     = var.droplet_size
  image    = var.droplet_image
  ssh_keys = [digitalocean_ssh_key.deploy.fingerprint]

  # Renderiza la plantilla cloud-init sustituyendo las variables (secretos, repo,
  # puertos...). El resultado se ejecuta como configuración inicial del servidor.
  user_data = templatefile("${path.module}/cloud-init.yaml.tftpl", {
    repo_url                      = var.repo_url
    repo_branch                   = var.repo_branch
    swap_size_mb                  = var.swap_size_mb
    app_port                      = var.app_port
    db_name                       = var.db_name
    db_user                       = var.db_user
    db_password                   = var.db_password
    mailer_service                = var.mailer_service
    mailer_email                  = var.mailer_email
    mailer_password               = var.mailer_password
    mapbox_token                  = var.mapbox_token
    appinsights_connection_string = var.appinsights_connection_string
  })

  # Etiquetas para identificar el recurso en el panel de DO.
  tags = ["petradar", "academico"]
}

# 3) Firewall: política de red atada al droplet.
#    - Entrante: solo SSH (22) y la API (app_port). Postgres (5432) y Redis (6379)
#      quedan inaccesibles desde internet.
#    - Saliente: todo permitido (necesario para apt, git clone y docker pull).
resource "digitalocean_firewall" "api" {
  name        = "${var.droplet_name}-fw"
  droplet_ids = [digitalocean_droplet.api.id]

  # --- Reglas de entrada ---
  inbound_rule {
    protocol         = "tcp"
    port_range       = "22"
    source_addresses = [var.allowed_ssh_cidr]
  }

  inbound_rule {
    protocol         = "tcp"
    port_range       = tostring(var.app_port)
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  # Permite hacer ping al servidor (diagnóstico).
  inbound_rule {
    protocol         = "icmp"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  # --- Reglas de salida (todo permitido) ---
  outbound_rule {
    protocol              = "tcp"
    port_range            = "1-65535"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }

  outbound_rule {
    protocol              = "udp"
    port_range            = "1-65535"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }

  outbound_rule {
    protocol              = "icmp"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }
}
