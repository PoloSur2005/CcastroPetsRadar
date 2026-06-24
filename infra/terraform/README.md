# Infraestructura — petradar-api (DigitalOcean + Terraform)

Despliega la API en un **droplet Debian 12** de DigitalOcean. La imagen Docker **se
construye en el propio servidor** (`git clone` + `docker compose up --build -d`); no
se publica en ningún registro. Toda la infraestructura se gestiona con **Terraform**.

## Estructura de archivos

| Archivo | Para qué sirve |
|---|---|
| `versions.tf` | Fija la versión de Terraform y del provider de DigitalOcean. Reproducibilidad. |
| `providers.tf` | Configura el provider de DO (el "driver" de la API). El token se pasa por variable. |
| `variables.tf` | Declara todas las entradas (tipo/descripción/default). Es el "contrato" de configuración. |
| `main.tf` | Recursos reales: llave SSH, droplet y firewall. |
| `cloud-init.yaml.tftpl` | Script de primer arranque: swap → Docker → clona repo → escribe `.env` → `docker compose up --build -d`. |
| `outputs.tf` | Imprime IP, URL de la API y comando SSH tras `apply`. |
| `terraform.tfvars.example` | Plantilla de variables (se versiona). |
| `terraform.tfvars` | Valores reales con secretos. **Gitignored**, NO se sube. |
| `.terraform.lock.hcl` | Bloqueo de versiones de providers (se genera con `init`; conviene versionarlo). |

> Lo que **no** se versiona: `terraform.tfvars`, `*.tfstate*` y el directorio `.terraform/`
> (ver `.gitignore` en la raíz del repo).

## Arquitectura

Un único droplet (`s-1vcpu-1gb`, ~6 USD/mes) corre 3 contenedores con docker compose:

```
Internet ──▶ Firewall DO ──▶ Droplet Debian 12
                │  22 (SSH)        ├─ contenedor api    (NestJS, puerto 3000) ◀── público
                │  3000 (API)      ├─ contenedor db     (PostGIS 15)  ── solo red interna
                └─ bloquea 5432/6379 └─ contenedor redis (Redis 7)    ── solo red interna
```

Postgres y Redis **no** son accesibles desde internet: el firewall solo abre 22 y 3000.

## Uso

```bash
# 1. Variables con tus secretos (gitignored)
cp terraform.tfvars.example terraform.tfvars
$EDITOR terraform.tfvars

# 2. Llave SSH (si no la tienes)
ssh-keygen -t ed25519 -f ~/.ssh/petradar_do -N ""

# 3. Desplegar
terraform init
terraform plan
terraform apply

# 4. Probar (el build tarda varios minutos en 1 GB de RAM)
curl "$(terraform output -raw api_url)"

# 5. Destruir todo cuando ya no se necesite (deja de cobrar)
terraform destroy
```

## Notas

- El estado (`terraform.tfstate`) contiene los secretos en texto plano: por eso está
  gitignored. Para un proyecto real se usaría un backend remoto cifrado (DO Spaces, S3…).
- Para restringir SSH solo a tu IP, define `allowed_ssh_cidr = "TU_IP/32"` en `terraform.tfvars`.
