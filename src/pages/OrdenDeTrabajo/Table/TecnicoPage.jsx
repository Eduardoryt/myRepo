import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit, faCheck, faInfoCircle, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Await, Link } from 'react-router-dom';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { ImFileEmpty } from "react-icons/im";
// import TablaVistaOrden from './TablaVistaOrden';
import { Th, Td, EstadoButton } from '../../../components/ui';
import { useOrden } from '../../../context/ordenDeTrabajoContext';
import Swal from 'sweetalert2';

export const TecnicoPage = () => {

  const { traerOrdenesDeTrabajo, informes, getCantidadTotalOrden,
    estadosTotales, eliminarInfo, actualizarEstadosOrden } = useOrden();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [solicitudesPerPage, setSolicitudesPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'folio', direction: 'desc' });
  const [filteredSolicitudes, setFilteredSolicitudes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const [datosCargados, seTdatosCargados] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);
  const [año, setAño] = useState("");
  const [mes, setMes] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editedData, setEditedData] = useState([]);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("");


  const abrirModal = () => {
    setIsModalOpen2(true);
  };

  const cerrarModal = () => {
    setIsModalOpen2(false);
    setIsEditing(false);
  };

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        await traerOrdenesDeTrabajo();
        await getCantidadTotalOrden();
        seTdatosCargados(true)
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar los informes:", error);
      }
    };
    if (!datosCargados) {
      fetchInfo()
    }

  }, [traerOrdenesDeTrabajo, getCantidadTotalOrden, datosCargados]);


  const estadoDeclinado = estadosTotales[5];

  const handleDelete = async (id) => {
    try {
      await eliminarInfo(id);
      seTdatosCargados(false)
    } catch (error) {
      console.error("Error deleting solicitud:", error);
    }
  };

  useEffect(() => {
    setFilteredSolicitudes(informes);

  }, [informes]);

  const filtrarSolicitud = (solicitud) => {
    const terminoBusqueda = searchTerm.toLowerCase();
    return (
      (solicitud.informe?.folio?.toLowerCase().includes(terminoBusqueda)) ||
      (solicitud.informe?.Solicita?.nombre?.toLowerCase().includes(terminoBusqueda)) ||
      (solicitud.informe?.Solicita?.areaSolicitante?.toLowerCase().includes(terminoBusqueda)) ||
      (solicitud.informe?.tipoDeMantenimiento?.toLowerCase().includes(terminoBusqueda)) ||
      (solicitud.informe?.tipoDeTrabajo?.toLowerCase().includes(terminoBusqueda)) ||
      (solicitud.informe?.tipoDeSolicitud?.toLowerCase().includes(terminoBusqueda)) ||
      (solicitud.informe?.descripcion?.toLowerCase().includes(terminoBusqueda)) ||
      (solicitud.informe?.solicitud?.tecnicos?.nombreCompleto?.toLowerCase().includes(terminoBusqueda)) ||
      (solicitud.informe?.estado?.nombre?.toLowerCase().includes(terminoBusqueda))
    );
  }

  useEffect(() => {
    if (!Array.isArray(informes) || informes.length === 0) return;
    const results = informes.filter(filtrarSolicitud);
    setFilteredSolicitudes(results);
    setCurrentPage(1);
  }, [searchTerm, informes]);
  
  const sortedSolicitudes = useMemo(() => {
    let sortableSolicitudes = [...filteredSolicitudes];
    if (sortConfig.key === 'estado') {
      sortableSolicitudes.sort((a, b) => {
        // Obtener los nombres del estado, manejando casos en que el estado puede no estar definido
        const estadoA = a.informe && a.informe.estado ? a.informe.estado.nombre.toLowerCase() : '';
        const estadoB = b.informe && b.informe.estado ? b.informe.estado.nombre.toLowerCase() : '';
  
        if (estadoA < estadoB) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (estadoA > estadoB) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    } else {
      sortableSolicitudes.sort((a, b) => {
        const aKey = a.informe ? a.informe[sortConfig.key] : a[sortConfig.key];
        const bKey = b.informe ? b.informe[sortConfig.key] : b[sortConfig.key];
  
        if (aKey < bKey) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aKey > bKey) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableSolicitudes;
  }, [filteredSolicitudes, sortConfig]);
  

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const indexOfLastSolicitud = currentPage * solicitudesPerPage;
  const indexOfFirstSolicitud = indexOfLastSolicitud - solicitudesPerPage;
  const currentSolicitudes = sortedSolicitudes.slice(indexOfFirstSolicitud, indexOfLastSolicitud);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const clearSearch = () => {
    setSearchTerm("");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center mt-50 text-cool-gray-50 font-bold  ">
          <div className="mb-4">Cargando...</div>
          <ImFileEmpty className="animate-spin text-purple-50-500 text-6xl" />
        </div>
      </div>
    );
  };

  const handleFilterChange = async () => {
    const selectedYear = isNaN(parseInt(año, 10)) ? null : parseInt(año, 10);
    const selectedMonth = mes !== "" ? parseInt(mes, 10) : null;
    const selectedEstado = estadosTotales.find(estado => estado.nombre === estadoSeleccionado) || null;

    const mesAnioIdestado = {
      mes: selectedMonth,
      anio: selectedYear,
      idEstado: selectedEstado?.id || null,
    };

    await getCantidadTotalOrden(mesAnioIdestado);

    const filteredByDate = informes.filter(solicitud => {
      const solicitudDate = new Date(solicitud.informe.fecha);
      const solicitudYear = solicitudDate.getFullYear();
      const solicitudMonth = solicitudDate.getMonth();

      const isYearMatch = selectedYear ? solicitudYear === selectedYear : true;
      const isMonthMatch = selectedMonth !== null ? solicitudMonth === selectedMonth : true;
      const isEstadoMatch = selectedEstado ? solicitud.informe.estado.nombre.toLowerCase().includes(selectedEstado.nombre.toLowerCase()) : true;

      return isYearMatch && isMonthMatch && isEstadoMatch;
    });

    setFilteredSolicitudes(filteredByDate);
  };

  const handleEditClick = () => {
    const dataWithId = estadosTotales.map(item => ({
      id: item.id,
      nombre: item.nombre
    }));
    setEditedData(dataWithId);
    setIsEditing(true);
  };

  const handleSaveClick = async () => {

    const dataToSave = editedData.map(item => ({
      id: item.id,
      nombre: item.nombre
    }));
    try {
      const res = await actualizarEstadosOrden(dataToSave);
      if (res) {
        Swal.fire("Datos guardados", res.data?.mensaje, "success");
        seTdatosCargados(false)
      }
    } catch (error) {
      console.error("Error actualizando estados:", error);
      Swal.fire("Error", "No se pudieron guardar los datos. Inténtalo nuevamente.", "error");
    }
    setIsEditing(false);
  };

  const handleCancelClick = () => {
    setIsEditing(false);

  };

  const handleChange = (index, field, value) => {
    const newData = [...editedData];
    newData[index] = { ...newData[index], [field]: value };
    setEditedData(newData);
  };

  return (
    <div className="overflow-x-auto p-4">
      <div className="mb-1 flex justify-between items-center">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center ps-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path>
            </svg>
          </div>
          <input
            type="text"
            id="table-search"
            className="block p-2 ps-10 text-sm text-black border border-black rounded-lg w-80 bg-white focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search for items"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              onClick={clearSearch}
            >
              <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 8.586l3.707-3.707a1 1 0 011.414 1.414L11.414 10l3.707 3.707a1 1 0 01-1.414 1.414L10 11.414l-3.707 3.707a1 1 0 01-1.414-1.414L8.586 10 4.879 6.293a1 1 0 011.414-1.414L10 8.586z" clipRule="evenodd"></path>
              </svg>
            </button>
          )}
        </div>
        <button onClick={abrirModal} className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >Consultar solicitudes</button>
        <div>
          <label htmlFor="entries-per-page" className="mr-2 text-white">Entradas por página:</label>
          <select
            id="entries-per-page"
            className="p-1 border border-black rounded-lg text-black"
            value={solicitudesPerPage}
            onChange={(e) => setSolicitudesPerPage(Number(e.target.value))}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
      <table className="w-full min-w-full divide-y divide-white-200 text-sm text-black rounded-lg overflow-hidden">
        <thead className="bg-black text-white">
          <tr>
            <Th onClick={() => requestSort('folio')} sortable={true}>FOLIO</Th>
            <Th onClick={() => requestSort('fecha')} sortable={true}>FECHA</Th>
            <Th onClick={() => requestSort('tipoDeMantenimiento')} sortable={true}>TIPO DE MANTENIMIENTO</Th>
            <Th onClick={() => requestSort('tipoDeTrabajo')} sortable={true}>TIPO DE TRABAJO</Th>
            <Th onClick={() => requestSort('tipoDeSolicitud')} sortable={true}>TIPO DE SOLICITUD</Th>
            <Th sortable={false} extraClass="w-2/12">DESCRIPCION DEL SERVICIO</Th>
            <Th onClick={() => requestSort('tecnicos.nombreCompleto')} sortable={true}>TÉCNICO</Th>
            <Th sortable={false} >EVIDENCIAS</Th>
            <Th onClick={() => requestSort('estado')} sortable={true}>ESTADO</Th>
            <Th sortable={false}>ACCIONES</Th>
            <Th sortable={false}>INFORME</Th>
          </tr>

        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {currentSolicitudes.map((solicitud, index) => (
            <tr
              key={index}
              className={`text-left ${solicitud.estado === estadoDeclinado ? 'border-red-900' : ''}`}
            >
              <Td>{solicitud.informe.folio}</Td>
              <Td>{new Date(solicitud.informe.fecha).toLocaleDateString()}</Td>
              <Td>{solicitud.informe.tipoDeMantenimiento}</Td>
              <Td>{solicitud.informe.tipoDeTrabajo}</Td>
              <Td>{solicitud.informe.tipoDeSolicitud}</Td>
              <Td>{solicitud.informe.descripcion}</Td>
              <Td>{solicitud.informe?.solicitud?.tecnicos?.nombreCompleto || "Sin Asignar"}</Td>
              <Td>
                <Link to={`/evidencias/${solicitud._id}?`} className="text-black font-bold">
                  VER
                </Link>
              </Td>
              <Td>
                <EstadoButton IdEstado={solicitud.informe?.estado?.id} nombreEstado={solicitud.informe?.estado?.nombre} />
              </Td>
              <Td className="p-1 whitespace-normal break-words border border-gray-400 text-center">
                {solicitud.informe?.estado?.nombre === estadoDeclinado ? (
                  <div>
                    <button className="text-red-500 border font-semibold border-red-500 px-2 py-1 rounded-lg" disabled>Declinado</button>
                    <button
                      onClick={() => handleDelete(solicitud._id)}
                      className="text-red-500 hover"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-center items-center space-x-2">
                    {solicitud.informe?.estado?.id !== 2 && solicitud.informe?.estado?.id !== 3 && solicitud.informe?.estado?.id !== 4 && solicitud.informe?.estado?.id !== 5 && (
                      <Link
                        className="text-blue-600 hover:text-blue-800"
                        to={`/tecnico/${solicitud._id}?editar=true`}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </Link>
                    )}

                    {solicitud.informe?.estado?.id !== 3 && solicitud.informe?.estado?.id !== 4 && solicitud.informe?.estado?.id !== 5 && (
                      <Link
                        className="text-blue-600 hover:text-blue-800"
                        to={`/asignarTec/${solicitud._id}?`}
                      >
                        <FontAwesomeIcon icon={faCheck} />
                      </Link>
                    )}

                    {(solicitud.informe?.estado?.id === 2 || solicitud.informe?.estado?.id === 3) && (
                      <Link
                        className="text-blue-600 hover:text-blue-800"
                        to={`/informacionOrden/${solicitud._id}?`}
                      >
                        <FontAwesomeIcon icon={faInfoCircle} />
                      </Link>
                    )}

                    {(solicitud.informe?.estado?.id === 3 || solicitud.informe?.estado?.id === 4) && (
                      <Link
                        className="text-blue-600 hover:text-blue-800"
                        to={`/tecnico2/${solicitud._id}?`}
                      >
                        <FontAwesomeIcon icon={faPlus} />
                      </Link>
                    )}

                    <button
                      onClick={() => handleDelete(solicitud._id)}
                      className="text-red-500 hover"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                )}
              </Td>
              <Td>
                <Link to={`/verInforme/${solicitud._id}?`} className="text-black font-bold">
                  CONSULTAR
                </Link>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>

      <nav aria-label="Page navigation example" className="flex items-center justify-between pt-4">
        <span className="text-sm font-normal text-black dark:text-black-400">
          Mostrando <span className="font-semibold text-black black:text-black">{indexOfFirstSolicitud + 1}-{indexOfLastSolicitud}</span> Total de Solicitudes: <span className="font-semibold text-black dark:text-black">{filteredSolicitudes.length}</span>
        </span>
        <ul className="inline-flex items-center -space-x-px h-8 text-sm">
          <li>
            <button
              onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1, selectedId)}
              className={`flex items-center justify-center px-3 h-8 leading-tight ${currentPage === 1
                ? "text-gray-400 border-gray-300 cursor-not-allowed" : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700"
                } dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white`}
            >
              <span className="sr-only">Previous</span>
              <svg className="w-2.5 h-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 1 1 5l4 4" />
              </svg>
            </button>
          </li>
          {Array.from({ length: Math.ceil(filteredSolicitudes.length / solicitudesPerPage) }, (_, i) => (
            <li key={i}>
              <button
                onClick={() => paginate(i + 1, selectedId)}
                className={`flex items-center justify-center px-3 h-8 leading-tight ${currentPage === i + 1
                  ? "text-black border border-black bg-blue-400 hover:bg-blue hover:text-black" : "text-black bg-white border border-black hover:bg-gray-100 hover:text-gray-700"}`}
              >
                {i + 1}
              </button>
            </li>
          ))}
          <li>
            <button
              onClick={() => paginate(currentPage < Math.ceil(filteredSolicitudes.length / solicitudesPerPage) ? currentPage + 1 : currentPage, selectedId)}
              className={`flex items-center justify-center px-3 h-8 leading-tight ${currentPage === Math.ceil(filteredSolicitudes.length / solicitudesPerPage)
                ? "text-gray-400 border-gray-300 cursor-not-allowed" : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700"
                } dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white`}
            >
              <span className="sr-only">Next</span>
              <svg className="w-2.5 h-2.5 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4" />
              </svg>
            </button>
          </li>
        </ul>
      </nav>

      {
        isModalOpen2 && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          >
            <div
              className="bg-white p-6 rounded-lg shadow-lg relative"
              onClick={(e) => e.stopPropagation()}
            >
              {!isEditing && (
                <div className="flex justify-between mb-4 space-x-4">
                  <div className="flex-1">
                    <label className="block text-black">Año:</label>
                    <input
                      type="number"
                      value={año}
                      onChange={(e) => setAño(e.target.value)}
                      className="border text-black border-gray-300 rounded p-1 w-full"
                      min="2022"
                      max={new Date().getFullYear()}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-black">Mes:</label>
                    <select
                      value={mes}
                      onChange={(e) => setMes(e.target.value)}
                      className="border text-black border-gray-300 rounded p-1 w-full"
                    >
                      <option value="">Todos</option>
                      <option value="0">Enero</option>
                      <option value="1">Febrero</option>
                      <option value="2">Marzo</option>
                      <option value="3">Abril</option>
                      <option value="4">Mayo</option>
                      <option value="5">Junio</option>
                      <option value="6">Julio</option>
                      <option value="7">Agosto</option>
                      <option value="8">Septiembre</option>
                      <option value="9">Octubre</option>
                      <option value="10">Noviembre</option>
                      <option value="11">Diciembre</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-black">Estado:</label>
                    <select
                      className="border text-black border-gray-300 rounded p-1 w-full"
                      value={estadoSeleccionado}
                      onChange={(e) => {
                        console.log('estadoSeleccionado (onChange):', e.target.value);
                        setEstadoSeleccionado(e.target.value);
                      }}
                    >
                      <option value="">Todos</option>
                      {estadosTotales.map((estado) => (
                        <option key={estado._id} value={estado._id}>
                          {estado.nombre}
                        </option>
                      ))}
                    </select>

                  </div>
                  <div className="flex-1 flex items-end">
                    <button
                      onClick={() => {
                        console.log('estadoSeleccionado (before filter):', estadoSeleccionado);
                        handleFilterChange();
                      }}
                      className="bg-green-500 text-white px-4 py-1 rounded h-fit"
                    >
                      Filtrar
                    </button></div>


                </div>
              )}

              {estadosTotales && estadosTotales.length > 0 && (
                <table className="w-full text-black text-left border-collapse bg-white">
                  <thead>
                    <tr>
                      <th className="border-b border-black px-4 py-2">Estado</th>
                      <th className="border-b border-black px-4 py-2">Cantidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estadosTotales.map((item, index) => (
                      <tr key={editedData[index]?.id || item.id}>
                        <td className="border-b border-black px-4 py-2">

                          {isEditing ? (
                            <input
                              type="text"
                              value={editedData[index]?.nombre || item.nombre}
                              onChange={(e) => handleChange(index, 'nombre', e.target.value)}
                              className="border border-gray-300 rounded p-1"
                            />
                          ) : (
                            item.nombre
                          )}
                        </td>
                        <td className="border-b border-black px-4 py-2">
                          {item.cantidadTotal}
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td className="border-b border-black px-4 py-2 font-bold">Total</td>
                      <td className="border-b border-black px-4 py-2 font-bold">
                        {estadosTotales.reduce((total, item) => total + item.cantidadTotal, 0)}
                      </td>
                    </tr>

                  </tbody>
                </table>
              )}


              <div className="text-center mt-4">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSaveClick}
                      className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                    >
                      <FontAwesomeIcon icon={faSave} /> Guardar Cambios
                    </button>
                    <button
                      onClick={handleCancelClick}
                      className="bg-red-500 text-white px-4 py-2 rounded"
                    >
                      <FontAwesomeIcon icon={faTimes} /> Cancelar
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleEditClick}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                  >
                    <FontAwesomeIcon icon={faEdit} /> Editar
                  </button>
                )}
              </div>
              <button
                className="absolute top-2 right-2 text-red-500"
                onClick={cerrarModal}
              >
                X
              </button>
            </div>
          </div>)
      }
    </div >
  );
};