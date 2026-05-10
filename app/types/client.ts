//Tabla temporal de cliente creada aparte para evita conflictos con el componente Timer, se exporta el tipo Cliente para ser utilizado en ambos componentes
export type Cliente = {
  id: number;
  tiempoLlegada: number;
  tiempoServicio: number;
  tiempoEspera: number;
  inicioServicio: number;
  finServicio: number;
  estado: string;
};

