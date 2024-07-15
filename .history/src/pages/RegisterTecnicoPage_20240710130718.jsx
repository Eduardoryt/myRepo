import React, { useRef, useState, useEffect } from "react";
import "react-datepicker/dist/react-datepicker.css";
import "../css/solicitud.css";
import { useForm } from "react-hook-form";
import { useSoli } from "../context/SolicitudContext";
import { Button } from "../components/ui";
import SubiendoImagenes from "../components/ui/SubiendoImagenes";
import { AutocompleteInput } from "../components/ui/AutocompleteInput";
AutocompleteInput

export const RegisterTecnicoPage = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const [fechaOrden, setFechaOrden] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const formRef = useRef([]);
  const subiendoImagenesRef = useRef(null);

  const [projectsLoaded, setProjectsLoaded] = useState(false);
  const [descripcion, setDescripcion] = useState(false);
  const [banderafolioInterno, setBanderaFolioInterno] = useState(false);
  const [banderaLlenaFolioInterno, setBanderallenaFolioInterno] = useState(false);
  const { createInfo, getIdsProyect, myFolioInternoInfo, traeFolioInternoInforme } = useSoli();
  const { historialOrden, traeHistorialOrden, } = useSoli();
  const [recentSuggestions, setRecentSuggestions] = useState([]);

  useEffect(() => {
    if (!projectsLoaded) {
      getIdsProyect()
        .then(() => {
          setProjectsLoaded(true);
        })
        .catch((error) => {
          console.error("Error fetching projects:", error);
        });
    }
  }, [projectsLoaded, getIdsProyect]);

  useEffect(() => {
    traeFolioInternoInforme();
    traeHistorialOrden();
    console.log("Folio Interno Info:", myFolioInternoInfo);
    setValue("folio", myFolioInternoInfo || "");
  }, []);

  const onSubmit = async (data, e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("folio", data.folio);
      formData.append("fechaOrden", fechaOrden);
      formData.append("folioExterno", data.folioExterno);
      formData.append("areasoli", data.areasoli);
      formData.append("solicita", data.solicita);
      formData.append("edificio", data.edificio);
      formData.append("tipoMantenimiento", data.tipoMantenimiento);
      formData.append("tipoTrabajo", data.tipoTrabajo);
      formData.append("tipoSolicitud", data.tipoSolicitud);
      formData.append("descripcion", data.descripcion);

      const files = subiendoImagenesRef.current.getFiles();
      for (let i = 0; i < files.length; i++) {
        formData.append(`imagen-${i}`, files[i]);
        console.log(`imagen-${i}`, files[i]);
      }

      console.log("Data to be submitted: ", formData);

      await createInfo(formData);
    } catch (error) {
      console.error("Error submitting form: ", error);
    }
  };

  return (
    <div className="mx-auto max-w-6xl p-4 text-black">
      <form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white p-6 rounded-md shadow-md">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-black">Orden de trabajo de mantenimiento a mobiliario e instalaciones</h2>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-3 gap-6 mb-4">
            <div>
              <label htmlFor="folio" className="block text-sm font-medium mb-1">
                No. de folio Interno:
              </label>
              <input
                type="text"
                id="folio"
                name="folio"
                className="w-full p-3 border border-gray-400 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                {...register("folio")}
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Selecciona la fecha:</label>
              <input
                type="date"
                id="fechaOrden"
                name="fechaOrden"
                className="w-full text-black p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                value={fechaOrden || ""}
                onChange={(e) => setFechaOrden(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="folioExterno" className="block text-sm font-medium mb-1">
                No. de folio Externo:
              </label>
              <input
                type="number"
                id="folioExterno"
                name="folioExterno"
                className="w-full p-3 border border-gray-400 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                {...register("folioExterno")}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-3 gap-6 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Area solicitante:
              </label>
              <input
                type="text"
                id="areasoli"
                name="areasoli"
                {...register("areasoli")}
                className="w-full p-3 border border-gray-400 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Solicita:
              </label>
              <input
                type="text"
                id="solicita"
                name="solicita"
                className="w-full p-3 border border-gray-400 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                {...register("solicita")}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Edificio:
              </label>
              <input
                type="text"
                id="edificio"
                name="edificio"
                className="w-full p-3 border border-gray-400 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                {...register("edificio")}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-3 gap-6 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de Mantenimiento:</label>
              <select
                id="tipoMantenimiento"
                {...register("tipoMantenimiento")}
                name="tipoMantenimiento"
                className="w-full p-3 border border-gray-400 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Seleccione un tipo de mantenimiento</option>
                <option value="Normal">Normal</option>
                <option value="Urgente">Urgente</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de Trabajo:</label>
              <select
                id="tipoTrabajo"
                {...register("tipoTrabajo")}
                name="tipoTrabajo"
                className="w-full p-3 border border-gray-400 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Seleccione el tipo de trabajo</option>
                <option value="preventivo">Preventivo</option>
                <option value="correctivo">Correctivo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de Solicitud:</label>
              <select
                id="tipoSolicitud"
                {...register("tipoSolicitud")}
                name="tipoSolicitud"
                className="w-full p-3 border border-gray-400 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Seleccione el tipo de solicitud</option>
                <option value="Educativo">PC Educativo</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>
          <SubiendoImagenes ref={subiendoImagenesRef} />
          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium mb-1">
              Descripción:
            </label>
            <textarea
              className="p-3 text-black w-full rounded-md resize-none border border-gray-400"
              id="obs"
              required
              name="obs"
              {...register("descripcion")}
            />
          </div>
          <div className="mt-6">
            <Button type="submit" className="mr-4">
              Enviar
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
