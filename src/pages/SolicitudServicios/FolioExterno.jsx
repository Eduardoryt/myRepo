import React, { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { folioExternoSchema } from '../../schemas/folio.js';
import Swal from "sweetalert2";
import { useSoli } from "../../context/SolicitudContext.jsx";
import { useAuth } from "../../context/authContext.jsx";
import "../../css/Animaciones.css";
import { GridContainer, Label, Title } from "../../components/ui/index.js";

export const FolioExterno = () => {
    const { id } = useParams();
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm({ resolver: zodResolver(folioExternoSchema) });

    const { unasoli, getunSolitud, actualizarSoliFolioExterno } = useSoli();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [datosCargados, setDatosCargados] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const cargarSolicitud = async () => {
            try {
                await getunSolitud(id);
                setDatosCargados(true);
            } catch (error) {
                console.error("Error al obtener la solicitud:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id && !datosCargados) {
            cargarSolicitud();
        }
    }, [id, datosCargados, getunSolitud]);

    useEffect(() => {
        if (datosCargados && unasoli) {
            llenaSolicitud(unasoli);
        }
    }, [datosCargados, unasoli]);

    const llenaSolicitud = async (solicitud) => {
        try {
            if (solicitud) {
                const { fecha, folio, folioExterno, proyecto, actividades, estado, areaSolicitante, tipoSuministro, procesoClave } = solicitud;

                const actividadesNombres = Array.isArray(actividades)
                    ? actividades.map(act => act.nombreActividadPropio || act.nombreActividad || "").join(", ")
                    : "";

                setValue("fecha", fecha ? new Date(fecha).toISOString().split('T')[0] : "");
                setValue("folio", folio || "");
                setValue("folioExterno", folioExterno || "");
                setValue("nombreProyecto", proyecto?.nombre || "");
                setValue("nombreActividades", actividadesNombres || "");
                setValue("estado", estado || "");
                setValue("areaSolicitante", areaSolicitante || "");
                setValue("tipoSuministro", tipoSuministro || "");
                setValue("procesoClave", procesoClave || "");
            }
        } catch (error) {
            console.error("Error al llenar la solicitud:", error);
        }
    };

    const onSubmit = async (data) => {
        try {
            data.id = id;
            data.estado = "Asignada";
            data.user = user;

            await actualizarSoliFolioExterno(id, data);

            Swal.fire({
                title: "¡Enviado!",
                text: "Los datos se han enviado correctamente.",
                icon: "success",
                confirmButtonText: "Aceptar",
            });

            setDatosCargados(false);
            navigate(-1);
        } catch (error) {
            console.error("Error al enviar los datos:", error);
            Swal.fire({
                title: "Error!",
                text: "Hubo un problema al enviar los datos.",
                icon: "error",
                confirmButtonText: "Aceptar",
            });
        }
    };

    if (loading) {
        return <div>Cargando...</div>;
    }

    return (
        <div className="flex items-center justify-center mx-auto max-w-8xl p-4 text-black" style={{ height: '90vh' }}>
            <form onSubmit={handleSubmit(onSubmit)} className="slide-down">
                <div className="bg-white p-6 rounded-md shadow-md">
                    <Title showBackButton={true}>Asignar Folio</Title>
                    <GridContainer>
                        <div>
                            <Label>Fecha:</Label>
                            <input
                                type="date"
                                disabled
                                id="fecha"
                                name="fecha"
                                className="w-full p-3 border border-gray-400 rounded-md focus:ring-indigo-500 focus:border-indigo-500 cursor-not-allowed"
                                {...register("fecha")}
                            />
                        </div>
                        <div>
                            <Label>No. de folio:</Label>
                            <input
                                type="text"
                                disabled
                                id="folio"
                                name="folio"
                                className="w-full p-3 border border-gray-400 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-gray-100 cursor-not-allowed"
                                {...register("folio")}
                            />
                        </div>
                        <div>
                            <Label>No. de folio externo:</Label>
                            <input
                                type="text"
                                id="folioExterno"
                                name="folioExterno"
                                maxLength={4}
                                className="w-full p-3 border border-gray-400 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                {...register("folioExterno")}
                            />
                            {errors.folioExterno && (
                                <p className="text-red-500 text-xs mt-1">{errors.folioExterno.message}</p>
                            )}
                        </div>
                    </GridContainer>

                    <Label>Proyecto:</Label>
                    <input
                        type="text"
                        disabled
                        className="w-full p-3 border mb-6 border-gray-400 rounded-md focus:ring-indigo-500 focus:border-indigo-500 cursor-not-allowed"
                        {...register("nombreProyecto")}
                    />
                    <Label>Actividades:</Label>
                    <input
                        type="text"
                        disabled
                        className="w-full p-3 border mb-6 border-gray-400 rounded-md focus:ring-indigo-500 focus:border-indigo-500 cursor-not-allowed"
                        {...register("nombreActividades")}
                    />
                    <div className="flex justify-center items-center text-center">
                        <button
                            type="submit"
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-md border border-black"
                        >
                            Enviar
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};
