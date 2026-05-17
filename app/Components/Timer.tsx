"use client";
import { useEffect, useRef, useState } from "react";
import ClientTable from "./ClientTable";
import { Cliente } from "../types/client";

// represenavion de funcion con variables globales como "tiempo, clientes, cola, cliente actual, cajero libre"
export default function Timer() {

  const [time, setTime] = useState(0);

  const [clientes, setClientes] = useState<Cliente[]>([]);

  const [cola, setCola] = useState<Cliente[]>([]);

  const [clienteActual, setClienteActual] = useState<Cliente | null>(null);

  const [cajeroLibre, setCajeroLibre] = useState(true);

  // limite maximo de clientes permitidos
  const LIMITE_CLIENTES = 50;

  // estado que controla si ya se alcanzo el limite
  const [limiteAlcanzado, setLimiteAlcanzado] = useState(false);

  // referencia que guarda el estado actual del cajero
  // sin recrear el setInterval
  const cajeroLibreRef = useRef(cajeroLibre);

  // sincroniza el ref cada vez que cambia cajeroLibre
  useEffect(() => {

    cajeroLibreRef.current = cajeroLibre;

  }, [cajeroLibre]);

  //Funcion que hace la randomizacion general de la tabla.
  function random(min: number, max: number) {

    return Math.floor(Math.random() * (max - min + 1)) + min;

  }

  //este disparador hace que en cierto intervalo de tiempo se actualice el timer de su posicion original mas 1 
  // y pare siempre y cuando un cliente haya acabado de realizar su tarea
  useEffect(() => {

    const interval = setInterval(() => {

      setTime((prevTime) => {

        const nuevoTiempo = prevTime + 1;

        setClientes((prevClientes) => {

          // detener generacion cuando llegue al limite
          if (prevClientes.length >= LIMITE_CLIENTES) {

            setLimiteAlcanzado(true);

            return prevClientes;

          }

          // obtener ultimo cliente registrado
          const ultimoCliente =
            prevClientes[prevClientes.length - 1];

          // calcular tiempo entre llegadas
          const tiempoEntreLlegadas =
            ultimoCliente
              ? nuevoTiempo - ultimoCliente.tiempoLlegada
              : nuevoTiempo;

          // crear nuevo cliente con tiempos y estado inicial
          const nuevoCliente: Cliente = {

            id: prevClientes.length + 1,

            tiempoLlegada: nuevoTiempo,

            tiempoEntreLlegadas: tiempoEntreLlegadas,

            tiempoServicio: random(1, 10),

            tiempoEspera: 0,

            inicioServicio: 0,

            finServicio: 0,

            tiempoTramite: 0,

            estado: "esperando"

          };

          // si el cajero esta libre se atiende inmediatamente
          if (cajeroLibreRef.current) {

            nuevoCliente.estado = "atendiendo";

            nuevoCliente.tiempoTramite = 0;

            nuevoCliente.inicioServicio = nuevoTiempo;

            nuevoCliente.finServicio =
              nuevoTiempo + nuevoCliente.tiempoServicio;

            setClienteActual(nuevoCliente);

            setCajeroLibre(false);

          } else {

            // si el cajero esta ocupado el cliente entra en cola
            nuevoCliente.estado = "en cola";

            setCola((prev) => [
              ...prev,
              nuevoCliente
            ]);

          }

          return [...prevClientes, nuevoCliente];

        });

        return nuevoTiempo;

      });

    }, 3000);

    return () => clearInterval(interval);

  }, []);
  //Segundo disparador que se enarga de dar los estados del timer segun el cliente actual y la cola de clientes esperando, 
  // ademas de actualizar los estados de cada cliente en la tabla
  useEffect(() => {

    if (!clienteActual) return;

    // actualizar reloj del cliente actual
    // actualizar reloj del cliente actual
    setTimeout(() => {

      setClientes((prevClientes) =>
        prevClientes.map((cliente) =>

          cliente.id === clienteActual.id
            ? {
              ...cliente,
              tiempoTramite:
                time - cliente.inicioServicio
            }
            : cliente

        )
      );

    }, 0);

    // revisa si el cliente terminó
    if (time >= clienteActual.finServicio) {

      setTimeout(() => {

        // marcar cliente actual como terminado
        setClientes((prevClientes) =>
          prevClientes.map((cliente) =>

            cliente.id === clienteActual.id
              ? {
                ...cliente,
                estado: "terminado",
                tiempoTramite: cliente.finServicio - cliente.inicioServicio
              }
              : cliente

          )
        );

        // revisar si hay clientes esperando
        if (cola.length > 0) {

          const siguienteCliente = { ...cola[0] };

          siguienteCliente.estado = "atendiendo";

          siguienteCliente.inicioServicio = time;

          siguienteCliente.finServicio =
            time + siguienteCliente.tiempoServicio;

          siguienteCliente.tiempoEspera =
            time - siguienteCliente.tiempoLlegada;

          // quitar de cola
          setCola((prev) => prev.slice(1));

          // actualizar cliente dentro de la tabla
          setClientes((prevClientes) =>
            prevClientes.map((cliente) =>

              cliente.id === siguienteCliente.id
                ? siguienteCliente
                : cliente

            )
          );

          // asignar nuevo cliente actual
          setClienteActual(siguienteCliente);

        } else {

          // liberar cajero
          setClienteActual(null);

          setCajeroLibre(true);

        }

      }, 0);

    }

  }, [time, clienteActual, cola]);

  // efecto que detecta cuando toda la simulacion termino
  useEffect(() => {

    if (

      limiteAlcanzado &&

      cola.length === 0 &&

      !clienteActual

    ) {

      console.log("SIMULACION TERMINADA");

    }

  }, [limiteAlcanzado, cola, clienteActual]);
  //muestreo del tiempo global junto a la tabla clientes
  return (

    <div className="min-h-screen bg-gray-100 p-8">

      <h1 className="text-4xl font-bold mb-8 text-center">
        Simulación de Cola
      </h1>

      {/* PANEL SUPERIOR */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">

        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-gray-500">
            Tiempo Global
          </h2>

          <p className="text-2xl font-bold">
            {time}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-gray-500">
            Cliente actual
          </h2>

          <p className="text-2xl font-bold">
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

          <p className="text-2xl font-bold">
            {cola.length}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-gray-500">
            Terminados
          </h2>

          <p className="text-2xl font-bold">
            {
              clientes.filter(
                (cliente) =>
                  cliente.estado === "terminado"
              ).length
            }
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-gray-500">
            Estado
          </h2>

          <p className="text-2xl font-bold">
            {
              limiteAlcanzado
                ? "Cerrado"
                : "Abierto"
            }
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