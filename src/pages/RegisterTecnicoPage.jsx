import React, { useRef, useState, useEffect } from "react";
import "../css/solicitud.css";
import { useForm } from "react-hook-form";
import { useOrden } from "../context/ordenDeTrabajoContext";
import { useNavigate } from "react-router-dom";
import "../css/Animaciones.css";
import { AutocompleteInput } from "../components/ui/AutocompleteInput";
import Swal from "sweetalert2";
import { GridContainer, Label, Title } from "../components/ui";
import imgPDF from '../img/imagenPDF.png';
import imgWord from '../img/imagenWord.png';

export const RegisterTecnicoPage = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const [fecha, setFecha] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const [isOpen, setIsOpen] = useState(false);
  const [clickedPDF, setClickedPDF] = useState(false);

  const [areasoli, setAreasoli] = useState("");
  const [solicita, setSolicita] = useState("");
  const [edificio, setEdificio] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [recentSuggestions, setRecentSuggestions] = useState([]);
  const [projectsLoaded, setProjectsLoaded] = useState(false);

  const inputRef = useRef([]);

  const { crearOrdenTrabajo, traerFolioInternoInforme, miFolioInternoInfo, traerHistorialOrden, historialOrden } = useOrden();

  useEffect(() => {
    const fetchData = async () => {
      try {
        await traerFolioInternoInforme();
        await traerHistorialOrden();
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (!projectsLoaded) {
      fetchData();
      setProjectsLoaded(true);
    }
  }, [projectsLoaded, traerFolioInternoInforme, traerHistorialOrden, miFolioInternoInfo, historialOrden]);

  const saveData = async (data) => {
    try {
      const informe = {
        Solicita: {
          nombre: solicita,
          areaSolicitante: areasoli,
          edificio,
        },
        fecha,
        tipoDeMantenimiento: data.tipoMantenimiento,
        tipoDeTrabajo: data.tipoTrabajo,
        tipoDeSolicitud: data.tipoSolicitud,
        descripcion,
      };
      console.log("Datos del formulario:", informe);

      await crearOrdenTrabajo(informe);
      Swal.fire({
        title: "Completado!",
        text: "Registro Exitoso",
        icon: "success",
        confirmButtonText: "Cool",
      });
      navigate('/tecnico/orden');
    } catch (error) {
      console.error("Error submitting form: ", error);
    }
  };

  const handleFormSubmit = async (data, event) => {
    event.preventDefault();
    setIsOpen(false);
    await saveData(data);

    const form = event.target;
    const formData = new FormData(form);
    const url = 'http://localhost/PlantillasWordyPdf/ManejoOrden.php';

    fetch(url, {
      method: 'POST',
      body: formData,
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.text();
      })
      .then(text => {
        console.log('Formulario enviado correctamente:', text);
        if (clickedPDF) {
          openVentana();
        } else {
          descargarWORD();
        }
      });
  };

  const descargarWORD = () => {
    const a = document.createElement('a');
    a.href = 'http://localhost/PlantillasWordyPdf/DescargarWordOrden.php';
    a.download = 'formSolicitud.docx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const openVentana = () => {
    const url = 'http://localhost/PlantillasWordyPdf/ResultadoOrden.pdf';
    const features = 'menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes';
    window.open(url, '_blank', features);
  };

  const handleOpenModal = (event) => {
    event.preventDefault();
    setIsOpen(true);
  };

  const handleCloseModal = (event) => {
    event.preventDefault();
    setIsOpen(false);
  };

  return (
    <div className="mx-auto max-w-6xl p-4 text-black">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="slide-down">
        <div className="bg-white p-6 rounded-md shadow-md">
          <Title>Orden De Trabajo De Mantenimiento A Mobiliario E Instalaciones</Title>
          <GridContainer>
            <div>
              <Label>No. de folio Externo:</Label>
              <input
                type="text"
                className="w-full p-3 border border-gray-400 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                {...register("folio")}
                value={miFolioInternoInfo || ""}
                disabled
              />
            </div>
            <div>
              <input type="hidden" name="folio" id="folio" value={miFolioInternoInfo} />
            </div>
            <div>
              <Label>Selecciona la fecha:</Label>
              <input
                type="date"
                id="fechaOrden"
                name="fechaOrden"
                className="w-full text-black p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
            </div>
          </GridContainer>
          <GridContainer>
            <div>
              <Label>Area solicitante:</Label>
              <AutocompleteInput
                index={0}
                value={areasoli}
                onChange={(newValue) => setAreasoli(newValue)}
                data={historialOrden}
                recentSuggestions={recentSuggestions}
                setRecentSuggestions={setRecentSuggestions}
                inputRefs={inputRef}
                placeholder="Ingrese el área solicitante"
                fieldsToCheck={['areaSolicitante']}
                ConvertirAInput={true}
                inputProps={{
                  id: "areasoli",
                  name: "areasoli",
                  type: "text",
                  maxLength: 500,
                  className: "w-full text-black p-3 border border-gray-400 rounded-md focus:ring-indigo-500 focus:border-indigo-500",
                }}
              />
            </div>
            <div>
              <Label>Solicita:</Label>
              <AutocompleteInput
                index={1}
                value={solicita}
                onChange={(newValue) => setSolicita(newValue)}
                data={historialOrden}
                recentSuggestions={recentSuggestions}
                setRecentSuggestions={setRecentSuggestions}
                inputRefs={inputRef}
                placeholder="Ingrese quien solicita"
                fieldsToCheck={['nombre']}
                ConvertirAInput={true}
                inputProps={{
                  id: "solicita",
                  name: "solicita",
                  type: "text",
                  maxLength: 500,
                  className: "w-full text-black p-3 border border-gray-400 rounded-md focus:ring-indigo-500 focus:border-indigo-500",
                }}
              />
            </div>
            <div>
              <Label>Edificio:</Label>
              <AutocompleteInput
                index={2}
                value={edificio}
                onChange={(newValue) => setEdificio(newValue)}
                data={historialOrden}
                recentSuggestions={recentSuggestions}
                setRecentSuggestions={setRecentSuggestions}
                inputRefs={inputRef}
                placeholder="Ingrese el edificio"
                fieldsToCheck={['edificio']}
                ConvertirAInput={true}
                inputProps={{
                  id: "edificio",
                  name: "edificio",
                  type: "text",
                  maxLength: 500,
                  className: "w-full text-black p-3 border border-gray-400 rounded-md focus:ring-indigo-500 focus:border-indigo-500",
                }}
              />
            </div>
          </GridContainer>
          <GridContainer>
            <div>
              <Label>Tipo de Mantenimiento:</Label>
              <select
                id="tipoMantenimiento"
                {...register("tipoMantenimiento", { required: true })}
                name="tipoMantenimiento"
                className="w-full p-3 border border-gray-400 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Seleccione un tipo de mantenimiento</option>
                <option value="Mobiliario">Mobiliario</option>
                <option value="Instalaciones">Instalaciones</option>
              </select>
            </div>
            <div>
              <Label>Tipo de Trabajo:</Label>
              <select
                id="tipoTrabajo"
                {...register("tipoTrabajo", { required: true })}
                name="tipoTrabajo"
                className="w-full p-3 border border-gray-400 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Seleccione el tipo de trabajo</option>
                <option value="Preventivo">Preventivo</option>
                <option value="Correctivo">Correctivo</option>
              </select>
            </div>
            <div>
              <Label>Tipo de Solicitud:</Label>
              <select
                id="tipoSolicitud"
                {...register("tipoSolicitud", { required: true })}
                name="tipoSolicitud"
                className="w-full p-3 border border-gray-400 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Seleccione el tipo de solicitud</option>
                <option value="Normal">Normal</option>
                <option value="Urgente">Urgente</option>
              </select>
            </div>
          </GridContainer>
          <Label>Descripción (servicio requerido)</Label>
          <AutocompleteInput
            index={3}
            value={descripcion}
            onChange={(newValue) => setDescripcion(newValue)}
            data={historialOrden}
            recentSuggestions={recentSuggestions}
            setRecentSuggestions={setRecentSuggestions}
            inputRefs={inputRef}
            placeholder="Ingrese una descripción"
            fieldsToCheck={['descripcionDelServicio']}
            inputProps={{
              type: "text",
              maxLength: 500,
              className: "w-full mb-5 resize-none text-black p-3 border border-gray-400 rounded-md focus:ring-indigo-500 focus:border-indigo-500",
            }}
          />
          <input name="descripcion" id="descripcion" type="hidden" value={descripcion} />
           {errors.tipoMantenimiento || errors.tipoTrabajo || errors.tipoSolicitud ? (
            <div className="text-red-500">Por favor, complete todos los campos requeridos.</div>
          ) : null}
          <div className="flex items-center justify-center">
            <button
              type="submit"
              onClick={handleOpenModal}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-md border border-black"
            >
              Guardar cambios
            </button>
          </div>
        </div>

        {isOpen && (
          <div
            id="static-modal"
            tabIndex="-1"
            aria-hidden={!isOpen}
            className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full flex"
          >
            <div className="relative p-4 w-full max-w-2xl max-h-full">
              <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Haga click en el tipo de archivo que desea generar:</h3>
                  <button
                    type="button"
                    className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                    onClick={handleCloseModal}
                  >
                    <svg
                      className="w-3 h-3"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 14 14"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                      />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-2 p-4 md:grid-cols-2 gap-6 ">
                  <div className="flex items-center justify-center">
                    <button
                      type="submit"
                      onClick={() => setClickedPDF(false)}
                      style={{ all: 'unset', cursor: 'pointer' }}
                    >
                      <img
                        src={imgWord}
                        style={{ marginLeft: '25px', width: '150px', height: '150px' }}
                      />
                    </button>
                  </div>

                  <div>
                    <button
                      type="submit"
                      onClick={() => setClickedPDF(true)}
                      style={{ all: 'unset', cursor: 'pointer' }}
                    >
                      <img
                        src={imgPDF}
                        style={{ width: '200px', height: '200px' }}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        

      </form>
    </div>
  );
};