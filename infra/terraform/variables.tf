# variables.tf
# ------------------------------------------------------------------------------
# Declara TODAS las entradas (inputs) del proyecto: el "contrato" de qué se puede
# configurar. Aquí solo se declaran (tipo, descripción, default); los valores
# reales se ponen en terraform.tfvars (gitignored). Las variables con secretos
# se marcan como sensitive para que Terraform no las imprima en consola.
# ------------------------------------------------------------------------------

# ---- Credenciales de infraestructura ----------------------------------------

variable "do_token" {
  description = "Token de la API de DigitalOcean (dop_v1_...). Se usa para crear los recursos."
  type        = string
  sensitive   = true
}

# ---- Parámetros del droplet -------------------------------------------------

variable "region" {
  description = "Región de DigitalOcean donde se crea el droplet."
  type        = string
  default     = "nyc3"
}

variable "droplet_size" {
  description = "Slug del tamaño del droplet. s-1vcpu-1gb ≈ 6 USD/mes."
  type        = string
  default     = "s-1vcpu-1gb"
}

variable "droplet_image" {
  description = "Imagen base del droplet (sistema operativo)."
  type        = string
  default     = "debian-12-x64"
}

variable "droplet_name" {
  description = "Nombre del droplet (etiqueta visible en el panel de DO)."
  type        = string
  default     = "petradar-api"
}

variable "swap_size_mb" {
  description = "Tamaño del swap file en MB que crea cloud-init (ayuda al build en 1 GB de RAM)."
  type        = number
  default     = 2048
}

# ---- Acceso SSH -------------------------------------------------------------

variable "ssh_pub_key_path" {
  description = "Ruta a la llave SSH PÚBLICA que se sube a DO para acceder al droplet."
  type        = string
  default     = "~/.ssh/petradar_do.pub"
}

variable "ssh_key_name" {
  description = "Nombre con el que se registra la llave SSH en DigitalOcean."
  type        = string
  default     = "petradar-deploy-key"
}

variable "allowed_ssh_cidr" {
  description = "CIDR autorizado para SSH (puerto 22). 0.0.0.0/0 = abierto a todo internet."
  type        = string
  default     = "0.0.0.0/0"
}

# ---- Despliegue de la aplicación --------------------------------------------

variable "repo_url" {
  description = "URL del repositorio Git que se clona y construye en el droplet."
  type        = string
  default     = "https://github.com/PoloSur2005/CcastroPetsRadar.git"
}

variable "repo_branch" {
  description = "Rama del repositorio a clonar."
  type        = string
  default     = "main"
}

variable "app_port" {
  description = "Puerto en el que la API queda expuesta públicamente."
  type        = number
  default     = 3000
}

# ---- Secretos de la aplicación (se inyectan al .env del droplet) -------------

variable "db_name" {
  description = "Nombre de la base de datos PostgreSQL."
  type        = string
  default     = "petradar"
}

variable "db_user" {
  description = "Usuario de PostgreSQL."
  type        = string
  default     = "postgres"
}

variable "db_password" {
  description = "Contraseña de PostgreSQL."
  type        = string
  sensitive   = true
}

variable "mailer_service" {
  description = "Servicio de correo (p. ej. gmail)."
  type        = string
  default     = "gmail"
}

variable "mailer_email" {
  description = "Cuenta de correo emisora."
  type        = string
  sensitive   = true
}

variable "mailer_password" {
  description = "Contraseña de aplicación del correo (16 caracteres en Gmail)."
  type        = string
  sensitive   = true
}

variable "mapbox_token" {
  description = "Token de Mapbox usado por la API."
  type        = string
  sensitive   = true
}

variable "appinsights_connection_string" {
  description = "Connection string de Azure Application Insights (opcional; vacío lo desactiva)."
  type        = string
  default     = ""
  sensitive   = true
}
