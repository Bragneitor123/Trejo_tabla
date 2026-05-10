"use client";
import { Cliente } from "../types/client";

type Props = {
  clientes: Cliente[];
};
// funcion de tabla clientes que se encarga de hacer aparecer la tabla en la interfaz UI basica en la pantalla
export default function ClientTable({ clientes }: Props) {

  return (
    
    <table border={1} cellPadding={10}>

      <thead>

        <tr>

          <th>Cliente</th>

          <th>Llegada</th>

          <th>Servicio</th>

          <th>Espera</th>

          <th>Inicio</th>

          <th>Fin</th>

          <th>Estado</th>

        </tr>

      </thead>

      <tbody>
        
        {clientes.map((cliente) => (

          <tr key={cliente.id}>

            <td>{cliente.id}</td>

            <td>{cliente.tiempoLlegada}</td>

            <td>{cliente.tiempoServicio}</td>

            <td>{cliente.tiempoEspera}</td>

            <td>{cliente.inicioServicio}</td>

            <td>{cliente.finServicio}</td>

            <td>{cliente.estado}</td>
          </tr>

        ))}

      </tbody>

    </table>

  );

}