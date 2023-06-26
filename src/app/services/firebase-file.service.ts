import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';

@Injectable({
  providedIn: 'root'
})
export class FirebaseFileService {

  constructor(private storage: AngularFireStorage) { }
  // Cargar archivo
  public cargarCloudStorage(nombreArchivo: string, datos: any) {
    return this.storage.upload(nombreArchivo, datos);
  }

  // Referencia del archivo
  public referenciaCloudStorage(nombreArchivo: string) {
    return this.storage.ref(nombreArchivo);
  }

  public deleteFileStorage(ruta: string, file: string) {
    console.log(ruta, '---', file);
    const storageRef = this.storage.ref(ruta);
    storageRef.child(file).delete();
  }
  
}