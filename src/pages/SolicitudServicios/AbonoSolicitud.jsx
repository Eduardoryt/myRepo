import React, { useState, useRef, useEffect } from "react";
import { useSoli } from "../../context/SolicitudContext";
import { useAuth } from "../../context/authContext";
import "../../css/solicitud.css";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { ImFileEmpty } from "react-icons/im";
import { useForm } from "react-hook-form";
import "../../css/Animaciones.css";
import { GridContainer, Label, Title } from "../../components/ui";
import { Link } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";

export const AbonoSolicitud = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { unasoli, getunSolitud, RealizarAbono } = useSoli();
    const { user } = useAuth();

    const [abonoCounter, setAbonoCounter] = useState(1);

    const { handleSubmit, register, setValue, formState: { errors } } = useForm();

    const formRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [datosCargados, setDatosCargados] = useState(false);
    const [showItems, setShowItems] = useState(false);
    const [items, setItems] = useState([]);
    const [allItemsCompleted, setAllItemsCompleted] = useState(false);


    useEffect(() => {
        const cargarSolicitud = async () => {
            try {
                await getunSolitud(id);
                setDatosCargados(true);
            } catch (error) {
                console.error("Error al obtener la solicitud:", error);
            }
        };

        if (id && !datosCargados) {
            cargarSolicitud();
        }
    }, [id, datosCargados, getunSolitud]);

    useEffect(() => {
        if (datosCargados) {
            llenaSolicitud();
        }
    }, [datosCargados]);

    useEffect(() => {
        verificarCompletados();
    }, [items]);


    const verificarCompletados = () => {
        const completados = items.every(item =>
            item.cantidadAcumulada === item.cantidad &&
            item.cantidadAcumulada !== undefined &&
            item.cantidad !== undefined
        );
        setAllItemsCompleted(completados);
    };


    const llenaSolicitud = () => {
        try {

            setValue("folio", unasoli.folio || "");
            setValue("folioExterno", unasoli.folioExterno || "");
            setValue("fecha", unasoli.fecha ? new Date(unasoli.fecha).toISOString().slice(0, 10) : "");
            setValue("items", unasoli.suministros || []);

            const nuevosItems = unasoli.suministros || [];
            console.log("nuevosItems:", nuevosItems); // Verifica los datos de los items

            setItems(nuevosItems);

            if (unasoli.folioExterno) {
                setShowItems(true);
            }
            verificarCompletados();
            setLoading(false);
        } catch (error) {
            console.error("Error al llenar los datos:", error);
        }
    };

    const onSubmit = async (data) => {
        try {
            data.id = id;
            data.user = user;
            const { NumEntregas, ...restData } = data;
            delete restData[""];

            for (const item of restData.items) {

                const totalCantidad = item.cantidadAcumulada + parseInt(item.cantidadEntregada, 10);
                if (totalCantidad > item.cantidad) {
                    Swal.fire({
                        title: "Error",
                        text: `La cantidad acumulada para el suministro excede la cantidad permitida.`,
                        icon: "error",
                        confirmButtonText: "OK",
                    });
                    return;
                }
            }
            const response = await RealizarAbono(id, restData);
            if (!response) {
                Swal.fire({
                    title: "Error",
                    text: "Llena todos los campos",
                    icon: "error",
                    confirmButtonText: "OK",
                });
            } else {
                setDatosCargados(false);
                Swal.fire({
                    title: "Completado!",
                    text: response.mensaje,
                    icon: "success",
                    confirmButtonText: "Cool",
                }).then(() => {
                    navigate('/soli');
                });
            }
        } catch (error) {
            console.error("Error al guardar los datos:", error);
            Swal.fire({
                title: "Error!",
                text: "Hubo un problema al realizar el abono",
                icon: "error",
                confirmButtonText: "Ok",
            });
        }
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
    }

    return (
        <div className="mx-auto max-w-6xl p-4 text-black">
            <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="slide-down">
                <div className="bg-white p-6 rounded-md shadow-md mb-4">
                    <Title showBackButton={true}>Área de Entregas </Title>
                    <GridContainer>
                        <div>
                            <Label>No. de folio:</Label>
                            <input
                                type="text"
                                disabled
                                id="folio"
                                name="folio"
                                className="w-full cursor-not-allowed p-3 border border-gray-400 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                {...register("folio")}
                            />
                            {errors.folio && <p>{errors.folio.message}</p>}
                        </div>
                        <div>
                            <Label>No. de folio externo:</Label>
                            <input
                                type="text"
                                disabled
                                id="folioExterno"
                                name="folioExterno"
                                className="w-full cursor-not-allowed  p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                {...register("folioExterno")}
                            />
                            {errors.folioExterno && <p>{errors.folioExterno.message}</p>}
                        </div>
                        <div>
                            <Label>Selecciona la fecha:</Label>
                            <input
                                type="date"
                                disabled
                                id="fecha"
                                name="fecha"
                                className="w-full p-3 border border-gray-400 rounded-md focus:ring-indigo-500 focus:border-indigo-500 cursor-not-allowed"
                                {...register("fecha")}
                            />
                        </div>
                    </GridContainer>
                    {allItemsCompleted && (
                        <div className="text-center mt-6">
                            <h1 className="text-green-500 text-3xl font-bold">¡Solicitud completada!</h1>
                            <FaCheckCircle className="text-green-500 text-5xl mt-4 mx-auto" />
                        </div>
                    )}
                </div>

                {showItems && items.map((item, index) => (
                    item.cantidadAcumulada !== item.cantidad && (
                        <div key={index} className="space-y-4 mb-4">
                            <div className="mb-1 bg-gray-100 p-4 rounded-lg shadow-lg">
                                <Label>Abono: {abonoCounter + index}</Label>
                                <div className="grid grid-cols-5 gap-4">
                                    <div className="">
                                        <Label>Cantidad:</Label>
                                        <input
                                            disabled
                                            type="number"
                                            placeholder="Ingrese una cantidad"
                                            className="w-full p-3 border border-gray-400 rounded-md focus:ring-indigo-500 focus:border-indigo-500 cursor-not-allowed"
                                            {...register(`items.${index}.cantidad`)}
                                            required
                                        />
                                        {errors.items?.[index]?.cantidad && (
                                            <p className="text-red-500 text-xs mt-1">{errors.items[index].cantidad.message}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label>Unidad de medida:</Label>
                                        <select
                                            className="w-full cursor-not-allowed p-3 border border-gray-400 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                            disabled
                                            {...register(`items.${index}.unidad`)}
                                        >
                                            <option value="">Seleccione una opción</option>
                                            <option value="Paquete">Paquete</option>
                                            <option value="Rollo">Rollo</option>
                                            <option value="Caja">Caja</option>
                                            <option value="Kit">Kit</option>
                                            <option value="Pieza">Pieza</option>
                                        </select>
                                        {errors.items?.[index]?.unidad && (
                                            <p className="text-red-500 text-xs mt-1">{errors.items[index].unidad.message}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label>Cantidad Acumulada:</Label>
                                        <input
                                            type="number"
                                            disabled
                                            className="w-full p-3 border border-gray-400 rounded-md focus:ring-indigo-500 focus:border-indigo-500 cursor-not-allowed"
                                            {...register(`items.${index}.cantidadAcumulada`)}
                                        />
                                    </div>
                                    <div>
                                        <Label>Cantidad a entregar:</Label>
                                        <input
                                            type="number"
                                            min={0}
                                            max={item.cantidad - item.cantidadAcumulada}
                                            className="w-full p-3 border border-gray-400 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                            {...register(`items.${index}.cantidadEntregada`, {
                                                validate: value => value <= item.cantidad - item.cantidadAcumulada || "La cantidad a entregar excede la cantidad restante."
                                            })}
                                        />
                                        {errors.items?.[index]?.cantidadEntregada && (
                                            <p className="text-red-500 text-xs mt-1">{errors.items[index].cantidadEntregada.message}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label>Número De Entregas:</Label>
                                        <input
                                            type="number"
                                            disabled
                                            id="NumeroDeEntregas"
                                            name="NumeroDeEntregas"
                                            className="w-full p-3 border border-gray-400 rounded-md focus:ring-indigo-500 focus:border-indigo-500 cursor-not-allowed"
                                            {...register(`items.${index}.NumeroDeEntregas`)}
                                        />
                                        {errors.items?.[index]?.NumeroDeEntregas && (
                                            <p className="text-red-500 text-xs mt-1">{errors.items[index].NumeroDeEntregas.message}</p>
                                        )}
                                    </div>
                                </div>
                                <Label>Descripción:</Label>
                                <textarea
                                    className="w-full p-3 cursor-not-allowed resize-none border border-gray-400 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Ingrese la descripción"
                                    {...register(`items.${index}.descripcion`)}
                                    disabled
                                ></textarea>
                                {errors.items?.[index]?.descripcion && (
                                    <p className="text-red-500 text-xs mt-1">{errors.items[index].descripcion.message}</p>
                                )}
                            </div>
                        </div>
                    )
                ))}
                {!allItemsCompleted && (
                    <div className="flex justify-center mt-8 space-x-6">
                        <Link
                            to={`/soli`}
                            className="bg-red-500 hover:bg-red-700 text-white font-bold mt px-6 py-3 rounded-md border border-black"
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            className="bg-green-500 hover:bg-green-700 text-white font-bold mt px-6 py-3 rounded-md border border-black"
                        >
                            Realizar Entrega
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};
