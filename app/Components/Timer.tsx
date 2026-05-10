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

          const nuevoCliente: Cliente = {

            id: prevClientes.length + 1,

            tiempoLlegada: nuevoTiempo,

            tiempoServicio: random(1, 10),

            tiempoEspera: 0,

            inicioServicio: 0,

            finServicio: 0,

            estado: "esperando"

          };

          // si el cajero esta libre se atiende inmediatamente
          if (cajeroLibreRef.current) {

            nuevoCliente.estado = "atendiendo";

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
  //Ssegundo disparador que se enarga de dar los estados del timer segun el cliente actual y la cola de clientes esperando, 
  // ademas de actualizar los estados de cada cliente en la tabla
  useEffect(() => {

    if (!clienteActual) return;

    // revisa si el cliente terminó
    if (time >= clienteActual.finServicio) {

      setTimeout(() => {

        // marcar cliente actual como terminado
        setClientes((prevClientes) =>
          prevClientes.map((cliente) =>

            cliente.id === clienteActual.id
              ? {
                ...cliente,
                estado: "terminado"
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
  //muestreo del tiempo global junto a la tabla clientes
  return (

    <div>

      <h1>Tiempo Global: {time}</h1>

      <h2>
        Cliente actual:
        {clienteActual
          ? ` Cliente ${clienteActual.id}`
          : " Ninguno"}
      </h2>

      <h2>
        Clientes en cola: {cola.length}
      </h2>

      <h2>
        Clientes terminados: {
          clientes.filter(
            (cliente) =>
              cliente.estado === "terminado"
          ).length
        }
      </h2>

      <h2>
        Total clientes: {clientes.length}
      </h2>

      <ClientTable clientes={clientes} />

    </div>

  );

}