"use client";

import { useEffect, useRef, useState } from "react";
import ClientTable from "./ClientTable";
import { Cliente } from "../types/client";

// representacion de funcion con variables globales
export default function Timer() {

  const [time, setTime] = useState(0);

  const [clientes, setClientes] = useState<Cliente[]>([]);

  const [cola, setCola] = useState<Cliente[]>([]);

  const [clienteActual, setClienteActual] =
    useState<Cliente | null>(null);

  const [cajeroLibre, setCajeroLibre] =
    useState(true);

  // limite maximo de clientes permitidos
  const LIMITE_CLIENTES = 50;

  // estado que controla si ya se alcanzo el limite
  const [limiteAlcanzado, setLimiteAlcanzado] =
    useState(false);

  // referencia que guarda el estado actual del cajero
  const cajeroLibreRef = useRef(cajeroLibre);

  // sincroniza el ref cada vez que cambia cajeroLibre
  useEffect(() => {

    cajeroLibreRef.current = cajeroLibre;

  }, [cajeroLibre]);

  // funcion random
  function random(min: number, max: number) {

    return Math.floor(
      Math.random() * (max - min + 1)
    ) + min;

  }

  // generador principal del sistema
  useEffect(() => {

    const interval = setInterval(() => {

      setTime((prevTime) => {

        const nuevoTiempo = prevTime + 1;

        // probabilidad de llegada de cliente
        const llegaCliente =
          Math.random() < 0.4; // minuto simulado

        setClientes((prevClientes) => {

          // detener simulacion
          if (
            prevClientes.length >=
            LIMITE_CLIENTES
          ) {

            setLimiteAlcanzado(true);

            return prevClientes;

          }

          // si no llega cliente este minuto
          if (!llegaCliente) {

            return prevClientes;

          }

          // obtener ultimo cliente
          const ultimoCliente =
            prevClientes[
            prevClientes.length - 1
            ];

          // calcular tiempo entre llegadas
          const tiempoEntreLlegadas =
            ultimoCliente
              ? nuevoTiempo -
              ultimoCliente.tiempoLlegada
              : nuevoTiempo;

          // crear cliente
          const nuevoCliente: Cliente = {

            id: prevClientes.length + 1,

            tiempoLlegada: nuevoTiempo,

            tiempoEntreLlegadas:
              tiempoEntreLlegadas,

            tiempoServicio:
              random(3, 10),

            tiempoEspera: 0,

            inicioServicio: 0,

            finServicio: 0,

            tiempoTramite: 0,

            estado: "esperando"

          };

          // cajero libre
          if (cajeroLibreRef.current) {

            nuevoCliente.estado =
              "atendiendo";

            nuevoCliente.inicioServicio =
              nuevoTiempo;

            nuevoCliente.finServicio =
              nuevoTiempo +
              nuevoCliente.tiempoServicio;

            setClienteActual(
              nuevoCliente
            );

            setCajeroLibre(false);

          } else {

            // entra a cola
            nuevoCliente.estado =
              "en cola";

            setCola((prev) => [
              ...prev,
              nuevoCliente
            ]);

          }

          return [
            ...prevClientes,
            nuevoCliente
          ];

        });
        return nuevoTiempo;

      });

    }, 3000);

    return () =>
      clearInterval(interval);

  }, []);

  // control de cliente actual
  useEffect(() => {

    if (!clienteActual) return;

    // actualizar tramite del cliente actual
    setTimeout(() => {

      setClientes((prevClientes) =>
        prevClientes.map((cliente) =>

          cliente.id === clienteActual.id
            ? {
              ...cliente,

              tiempoTramite:
                time -
                cliente.inicioServicio
            }
            : cliente

        )
      );

    }, 0);

    // revisar si termino
    if (
      time >=
      clienteActual.finServicio
    ) {

      setTimeout(() => {

        // marcar como terminado
        setClientes((prevClientes) =>
          prevClientes.map((cliente) =>

            cliente.id ===
              clienteActual.id
              ? {
                ...cliente,

                estado: "terminado",

                tiempoTramite:
                  cliente.finServicio -
                  cliente.inicioServicio
              }
              : cliente

          )
        );

        // revisar cola
        if (cola.length > 0) {

          const siguienteCliente = {
            ...cola[0]
          };

          siguienteCliente.estado =
            "atendiendo";

          siguienteCliente.inicioServicio =
            time;

          siguienteCliente.finServicio =
            time +
            siguienteCliente.tiempoServicio;

          siguienteCliente.tiempoEspera =
            time -
            siguienteCliente.tiempoLlegada;

          // quitar de cola
          setCola((prev) =>
            prev.slice(1)
          );

          // actualizar cliente
          setClientes((prevClientes) =>
            prevClientes.map((cliente) =>

              cliente.id ===
                siguienteCliente.id
                ? siguienteCliente
                : cliente

            )
          );

          // asignar nuevo cliente actual
          setClienteActual(
            siguienteCliente
          );

        } else {

          // liberar cajero
          setClienteActual(null);

          setCajeroLibre(true);

        }

      }, 0);

    }

  }, [time, clienteActual, cola]);

  // detectar finalizacion
  useEffect(() => {

    if (

      limiteAlcanzado &&

      cola.length === 0 &&

      !clienteActual

    ) {

      console.log(
        "SIMULACION TERMINADA"
      );

    }

  }, [
    limiteAlcanzado,
    cola,
    clienteActual
  ]);

  // promedio espera
  const promedioEspera =

    clientes.length > 0

      ? (

        clientes.reduce(

          (acc, cliente) =>

            acc +
            cliente.tiempoEspera,

          0

        ) / clientes.length

      ).toFixed(2)

      : "0";

  // promedio uso cajero
  const promedioUsoCajero =

    clientes.length > 0

      ? (

        clientes.reduce(

          (acc, cliente) =>

            acc +
            cliente.tiempoTramite,

          0

        ) / clientes.length

      ).toFixed(2)

      : "0";

  // render
  return (

    <div className="min-h-screen bg-gray-100 p-8">

      <h1 className="text-4xl font-bold mb-8 text-center text-black">

        Simulación de Cola

      </h1>

      {/* PANEL SUPERIOR */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-8">

        <div className="bg-white p-4 rounded-xl shadow">

          <h2 className="text-gray-500">
            Tiempo Global
          </h2>

          <p className="text-2xl font-bold text-black">
            {time} min
          </p>

        </div>

        <div className="bg-white p-4 rounded-xl shadow">

          <h2 className="text-gray-500">
            Cliente actual
          </h2>

          <p className="text-2xl font-bold text-black">

            {
              clienteActual
                ? clienteActual.id
                : "Ninguno"
            }

          </p>

        </div>

        <div className="bg-white p-4 rounded-xl shadow">

          <h2 className="text-gray-500">
            En cola
          </h2>

          <p className="text-2xl font-bold text-black">
            {cola.length}
          </p>

        </div>

        <div className="bg-white p-4 rounded-xl shadow">

          <h2 className="text-gray-500">
            Terminados
          </h2>

          <p className="text-2xl font-bold text-black">

            {
              clientes.filter(
                (cliente) =>
                  cliente.estado ===
                  "terminado"
              ).length
            }

          </p>

        </div>

        <div className="bg-white p-4 rounded-xl shadow">

          <h2 className="text-gray-500">
            Estado
          </h2>

          <p className="text-2xl font-bold text-black">

            {
              limiteAlcanzado
                ? "Cerrado"
                : "Abierto"
            }

          </p>

        </div>

        <div className="bg-white p-4 rounded-xl shadow">

          <h2 className="text-gray-500">
            Promedio Espera
          </h2>

          <p className="text-2xl font-bold text-black">
            {promedioEspera} min
          </p>

        </div>

        <div className="bg-white p-4 rounded-xl shadow">

          <h2 className="text-gray-500">
            Uso Promedio Cajero
          </h2>

          <p className="text-2xl font-bold text-black">
            {promedioUsoCajero} min
          </p>

        </div>

      </div>

      {/* TABLA */}
      <div className="bg-white rounded-xl shadow p-4 overflow-auto">

        <ClientTable clientes={clientes} />

      </div>

    </div>

  );

}