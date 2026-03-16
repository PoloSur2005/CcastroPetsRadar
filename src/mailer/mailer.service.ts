import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { FoundPet } from '../found-pets/entities/found-pet.entity';
import { LostPet } from '../lost-pets/entities/lost-pet.entity';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  private readonly transporter = nodemailer.createTransport({
    service: process.env.MAILER_SERVICE ?? 'gmail',
    auth: {
      user: process.env.MAILER_EMAIL,
      pass: process.env.MAILER_PASSWORD,
    },
  });

  async sendMatchNotification(
    lostPet: LostPet,
    foundPet: FoundPet,
    distance: number,
  ): Promise<void> {

    if (!process.env.MAILER_EMAIL || !process.env.MAILER_PASSWORD) {
      this.logger.warn('MAILER_EMAIL/MAILER_PASSWORD no configurados. Se omite envío de correo.');
      return;
    }

    if (!lostPet.location?.coordinates || !foundPet.location?.coordinates) {
      this.logger.warn('Una mascota no tiene coordenadas. No se puede generar mapa.');
      return;
    }

    const [lostLng, lostLat] = lostPet.location.coordinates;
    const [foundLng, foundLat] = foundPet.location.coordinates;

    const mapUrl = this.buildMapboxStaticMapUrl(lostLng, lostLat, foundLng, foundLat);

    const googleMapsLink = `https://www.google.com/maps?q=${foundLat},${foundLng}`;

    await this.transporter.sendMail({
      from: process.env.MAILER_EMAIL,
      to: lostPet.owner_email,
      subject: '🐾 Posible coincidencia de tu mascota perdida - PetRadar',
      html: `
      <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:30px;">
        <div style="max-width:650px;margin:auto;background:white;border-radius:10px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1);">

          <div style="background:#2563eb;color:white;padding:20px;text-align:center;">
            <h2 style="margin:0;">🐾 PetRadar encontró una posible coincidencia</h2>
          </div>

          <div style="padding:25px">

            <p style="font-size:16px;">
              Encontramos una mascota que coincide con las características de la que reportaste como perdida.
            </p>

            <p style="font-size:16px;">
              <strong>Distancia aproximada:</strong> ${Math.round(distance)} metros
            </p>

            <h3 style="margin-top:25px;">📍 Ubicación aproximada</h3>

            <a href="${googleMapsLink}" target="_blank">
              <img 
                src="${mapUrl}" 
                alt="Mapa de ubicación"
                style="width:100%;border-radius:8px;border:1px solid #ddd;margin-top:10px;"
              />
            </a>

            <p style="font-size:13px;color:#666;">
              Haz clic en el mapa para abrir la ubicación en Google Maps.
            </p>

            <h3 style="margin-top:30px;">🐱 Datos de la mascota encontrada</h3>

            <table style="width:100%;border-collapse:collapse;font-size:15px;">
              <tr><td><strong>Especie:</strong></td><td>${foundPet.species}</td></tr>
              <tr><td><strong>Raza:</strong></td><td>${foundPet.breed ?? 'No especificada'}</td></tr>
              <tr><td><strong>Color:</strong></td><td>${foundPet.color}</td></tr>
              <tr><td><strong>Tamaño:</strong></td><td>${foundPet.size}</td></tr>
              <tr><td><strong>Descripción:</strong></td><td>${foundPet.description}</td></tr>
              <tr><td><strong>Dirección:</strong></td><td>${foundPet.address}</td></tr>
            </table>

            <h3 style="margin-top:30px;">📞 Contacto de quien encontró la mascota</h3>

            <table style="width:100%;border-collapse:collapse;font-size:15px;">
              <tr><td><strong>Nombre:</strong></td><td>${foundPet.finder_name}</td></tr>
              <tr><td><strong>Email:</strong></td><td>${foundPet.finder_email}</td></tr>
              <tr><td><strong>Teléfono:</strong></td><td>${foundPet.finder_phone}</td></tr>
            </table>

          </div>

          <div style="background:#f1f5f9;text-align:center;padding:15px;font-size:12px;color:#555;">
            PetRadar • Sistema de búsqueda de mascotas perdidas
          </div>

        </div>
      </div>
      `,
    });

    this.logger.log(`Correo enviado a ${lostPet.owner_email}`);
  }

  private buildMapboxStaticMapUrl(
    lostLng: number,
    lostLat: number,
    foundLng: number,
    foundLat: number,
  ): string {
    const token = process.env.MAPBOX_TOKEN ?? '';
    const markers = `pin-s-l+ff0000(${lostLng},${lostLat}),pin-s-f+0000ff(${foundLng},${foundLat})`;

    return `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${markers}/${foundLng},${foundLat},13/700x420?access_token=${token}`;
  }
}
