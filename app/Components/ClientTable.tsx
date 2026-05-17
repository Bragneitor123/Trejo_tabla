"use client";

import { Cliente } from "../types/client";

type Props = {
  clientes: Cliente[];
};

// funcion de tabla clientes que se encarga de hacer aparecer la tabla en la interfaz UI basica en la pantalla
export default function ClientTable({ clientes }: Props) {

  return (

    <table className="w-full border-collapse">

      <thead>

        <tr className="bg-gray-200">

          <th className="p-3">Cliente</th>
          <th className="p-3">Llegada</th>
          <th className="p-3">Entre Llegadas</th>
          <th className="p-3">Servicio</th>
          <th className="p-3">Espera</th>
          <th className="p-3">Inicio</th>
          <th className="p-3">Fin</th>
          <th className="p-3">Trámite</th>
          <th className="p-3">Estado</th>

        </tr>

      </thead>

      <tbody>

        {clientes.map((cliente) => (

          <tr
            key={cliente.id}
            className="border-b text-center"
          >

            <td className="p-2">{cliente.id}</td>

            <td className="p-2">
              {cliente.tiempoLlegada}
            </td>

            <td className="p-2">
              {cliente.tiempoEntreLlegadas}
            </td>

            <td className="p-2">
              {cliente.tiempoServicio}
            </td>

            <td className="p-2">
              {cliente.tiempoEspera}
            </td>

            <td className="p-2">
              {cliente.inicioServicio}
            </td>

            <td className="p-2">
              {cliente.finServicio}
            </td>

            <td className="p-2">
              {cliente.tiempoTramite}
            </td>

            <td className="p-2">

              <span
                className={`
                px-3 py-1 rounded-full text-white text-sm
                ${cliente.estado === "terminado"
                    ? "bg-green-500"
                    : cliente.estado === "atendiendo"
                      ? "bg-blue-500"
                      : "bg-yellow-500"
                  }
              `}
              >

                {cliente.estado}

              </span>

            </td>

          </tr>

        ))}

      </tbody>

    </table>

  );

}