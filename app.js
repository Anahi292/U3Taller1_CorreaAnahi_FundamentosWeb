const historialEstudiantes = [];

const inputBuscar = document.getElementById("inputBuscar");
const btnBuscar = document.getElementById("btnBuscar");
const btnEvaluar = document.getElementById("btnEvaluar");
const btnLimpiar = document.getElementById("btnLimpiar");
const btnListar = document.getElementById("btnListar");
const btnRanking = document.getElementById("btnRanking");

btnEvaluar.addEventListener("click", evaluarEstudiante);
btnLimpiar.addEventListener("click", limpiarFormulario);
btnListar.addEventListener("click", mostrarTablaHistorial);
btnBuscar.addEventListener("click", buscarEstudiante);
btnRanking.addEventListener("click", mostrarRanking);

function evaluarEstudiante() {
    const nombre = document.getElementById("nombre").value.trim();
    const carrera = document.getElementById("carrera").value;
    const nota1Texto = document.getElementById("nota1").value;
    const nota2Texto = document.getElementById("nota2").value;
    const nota3Texto = document.getElementById("nota3").value;
    const nota4Texto = document.getElementById("nota4").value;

    if (nombre === "" || carrera === "" || nota1Texto === "" || nota2Texto === "" || nota3Texto === "" || nota4Texto === "") {
        mostrarResultado("Llena todos los campos", "warning");
        return;
    }

    const notas = [Number(nota1Texto), Number(nota2Texto), Number(nota3Texto), Number(nota4Texto)];

    if (existeNotainvalida(notas)) {
        mostrarResultado("Cada nota debe estar entre 0 a 20", "warning");
        return;
    }

    if (existeNombreRepetido(nombre)) {
        mostrarResultado(`Ya existe un estudiante registrado con el nombre "${nombre}". Ingresa un nombre distinto.`, "warning");
        return;
    }

    const promedio = calcularPromedio(notas);
    const estado = clasificarEstado(promedio);
    const rendimiento = clasificarRendimiento(promedio);
    const extremos = evaluarnota(notas);
    const cantidad = contarnotas(notas);
    const promedioEspecial = promedioSinNotaBaja(notas);
    const recomendacion = estadoRecomendacionAcademica(promedio);
    const beca = calcularBeca(carrera, promedio);

    const estudiante = {
        nombre: nombre,
        carrera: carrera,
        notas: notas,
        promedio: promedio,
        promedioEspecial: promedioEspecial,
        notaMayor: extremos.mayor,
        notaMenor: extremos.menor,
        estado: estado,
        rendimiento: rendimiento,
        beca: beca.texto,
        recomendacion: recomendacion
    };

    historialEstudiantes.push(estudiante);

    mostrarResultado(construirMensaje(estudiante, cantidad), obtenerColorEstado(estado));
    mostrarBeca(beca);
    mostrarJSONLista();
    actualizarPanelEstadisticas();
    console.table(estudiante);
}

function mostrarResultado(mensaje, tipo) {
    const resultado = document.getElementById("resultado");
    resultado.className = `alert alert-${tipo} mt-4`;
    resultado.classList.remove("d-none");
    resultado.textContent = mensaje;
    resultado.style.whiteSpace = "pre-line";
}

function existeNotainvalida(notas) {
    for (const nota of notas) {
        if (Number.isNaN(nota) || nota < 0 || nota > 20) {
            return true;
        }
    }
    return false;
}

function existeNombreRepetido(nombre) {
    return historialEstudiantes.some(est => est.nombre.toLowerCase() === nombre.toLowerCase());
}

function calcularPromedio(notas) {
    let contar = 0;
    for (const nota of notas) {
        contar += nota;
    }
    return contar / notas.length;
}

function clasificarEstado(promedio) {
    if (promedio >= 14) {
        return "Aprobado";
    } else if (promedio >= 10) {
        return "Recuperacion";
    } else {
        return "Reprobado";
    }
}

function clasificarRendimiento(promedio) {
    if (promedio >= 18) {
        return "Alto";
    } else if (promedio >= 14) {
        return "Medio";
    } else if (promedio >= 10) {
        return "Básico";
    } else {
        return "Bajo";
    }
}

function calcularBeca(carrera, promedio) {
    if (carrera === "TI" && promedio > 18) {
        return { porcentaje: 100, texto: "Beca del 100%", color: "success" };
    } else if (carrera === "Software" && promedio > 17) {
        return { porcentaje: 80, texto: "Beca del 80%", color: "primary" };
    } else if (carrera === "Sistemas" && promedio > 16) {
        return { porcentaje: 60, texto: "Beca del 60%", color: "warning" };
    } else {
        return { porcentaje: 0, texto: "Sin beca", color: "secondary" };
    }
}

function mostrarBeca(beca) {
    const contenedorBeca = document.getElementById("beca");
    contenedorBeca.className = `alert alert-${beca.color} mt-4`;
    contenedorBeca.classList.remove("d-none");
    contenedorBeca.textContent = `Resultado de beca: ${beca.texto}`;
}

function obtenerColorEstado(estado) {
    switch (estado) {
        case "Aprobado":
            return "success";
        case "Recuperacion":
            return "warning";
        case "Reprobado":
            return "danger";
        default:
            return "info";
    }
}

function construirMensaje(estudiante, cantidad) {
    return `El estudiante ${estudiante.nombre} tiene un promedio de: ${estudiante.promedio.toFixed(2)}/20,
    por este motivo tiene un estado: ${estudiante.estado} y un rendimiento: ${estudiante.rendimiento}.
    La nota más alta es: ${estudiante.notaMayor}, y la nota más baja es: ${estudiante.notaMenor}.
    Cantidad de notas aprobadas: ${cantidad.aprobadas}, en recuperación: ${cantidad.recuperacion}, reprobadas: ${cantidad.reprobadas}.
    Promedio especial (sin la nota más baja): ${estudiante.promedioEspecial.toFixed(2)}/20.
    Recomendación académica: ${estudiante.recomendacion}
    `;
}

function evaluarnota(notas) {
    let mayor = notas[0];
    let menor = notas[0];

    for (const nota of notas) {
        if (nota > mayor) {
            mayor = nota;
        }
        if (nota < menor) {
            menor = nota;
        }
    }
    return { mayor, menor };
}

function contarnotas(notas) {
    let aprobadas = 0;
    let reprobadas = 0;
    let recuperacion = 0;
    for (const nota of notas) {
        if (nota >= 14) {
            aprobadas++;
        } else if (nota >= 10) {
            recuperacion++;
        } else {
            reprobadas++;
        }
    }
    return { aprobadas, reprobadas, recuperacion };
}

function mostrarJSON(estudiante) {
    const salida = document.getElementById("salidaJSON");
    salida.classList.remove("d-none");
    salida.textContent = JSON.stringify(estudiante, null, 2);
}

function mostrarJSONLista() {
    const salida = document.getElementById("salidaJSON");
    salida.classList.remove("d-none");
    salida.textContent = JSON.stringify(historialEstudiantes, null, 2);
}

function promedioSinNotaBaja(notas) {
    const extremos = evaluarnota(notas);
    const copiaNotas = [...notas];
    const indiceMenor = copiaNotas.indexOf(extremos.menor);
    copiaNotas.splice(indiceMenor, 1);
    return calcularPromedio(copiaNotas);
}

function estadoRecomendacionAcademica(promedio) {
    if (promedio >= 18) {
        return "Mantener el desempeño y apoyar a compañeros";
    } else if (promedio >= 14) {
        return "Reforzar temas específicos";
    } else if (promedio >= 10) {
        return "Asistir a tutorías y practicar ejercicios";
    } else {
        return "Repetir contenidos base y solicitar acompañamiento";
    }
}

function mostrarTablaHistorial() {
    const contenedorTabla = document.getElementById("contenedorTabla");
    const cuerpoTabla = document.getElementById("cuerpoTabla");

    if (historialEstudiantes.length === 0) {
        mostrarResultado("No hay estudiantes evaluados en el historial", "info");
        return;
    }
    cuerpoTabla.innerHTML = "";
    historialEstudiantes.forEach((est, index) => {
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${index + 1}</td>
            <td>${est.nombre}</td>
            <td>${est.carrera}</td>
            <td>${est.notas.join(" - ")}</td>
            <td>${est.promedio.toFixed(2)}</td>
            <td>${est.estado}</td>
            <td>${est.rendimiento}</td>
            <td>${est.beca}</td>`;

        cuerpoTabla.appendChild(fila);
    });
    contenedorTabla.classList.remove("d-none");
}

function generarRanking() {
    const copia = [...historialEstudiantes];
    copia.sort((a, b) => b.promedio - a.promedio);
    return copia;
}

function mostrarRanking() {
    const contenedorRanking = document.getElementById("contenedorRanking");
    const cuerpoRanking = document.getElementById("cuerpoRanking");

    if (historialEstudiantes.length === 0) {
        mostrarResultado("No hay estudiantes evaluados para generar el ranking", "info");
        return;
    }

    const ranking = generarRanking();
    cuerpoRanking.innerHTML = "";
    ranking.forEach((est, index) => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${index + 1}</td>
            <td>${est.nombre}</td>
            <td>${est.carrera}</td>
            <td>${est.promedio.toFixed(2)}</td>
            <td>${est.rendimiento}</td>`;
        cuerpoRanking.appendChild(fila);
    });
    contenedorRanking.classList.remove("d-none");
}

function estudiantesEvaluados() {
    return historialEstudiantes.length;
}

function contarAprobadosRecuperacionReprobados() {
    let aprobados = 0;
    let recuperacion = 0;
    let reprobados = 0;
    for (const est of historialEstudiantes) {
        if (est.promedio >= 14) {
            aprobados++;
        } else if (est.promedio >= 10) {
            recuperacion++;
        } else {
            reprobados++;
        }
    }
    return { aprobados, recuperacion, reprobados };
}

function promedioGeneralTodosEstudiantes() {
    if (historialEstudiantes.length === 0) {
        return 0;
    }
    const sumaPromedios = historialEstudiantes.reduce((acc, est) => acc + est.promedio, 0);
    return sumaPromedios / historialEstudiantes.length;
}

function mejorPeorEstudiante() {
    if (historialEstudiantes.length === 0) {
        return { mejor: null, peor: null };
    }
    let mejor = historialEstudiantes[0];
    let peor = historialEstudiantes[0];
    for (const est of historialEstudiantes) {
        if (est.promedio > mejor.promedio) {
            mejor = est;
        }
        if (est.promedio < peor.promedio) {
            peor = est;
        }
    }
    return { mejor, peor };
}

function actualizarPanelEstadisticas() {
    const panel = document.getElementById("panelEstadisticas");
    const resultados = contarAprobadosRecuperacionReprobados();
    const extremosCurso = mejorPeorEstudiante();

    document.getElementById("statTotal").textContent = estudiantesEvaluados();
    document.getElementById("statAprobados").textContent = resultados.aprobados;
    document.getElementById("statRecuperacion").textContent = resultados.recuperacion;
    document.getElementById("statReprobados").textContent = resultados.reprobados;
    document.getElementById("statPromedioGeneral").textContent = promedioGeneralTodosEstudiantes().toFixed(2);

    document.getElementById("statMejor").textContent = extremosCurso.mejor
        ? `Mejor promedio: ${extremosCurso.mejor.nombre} (${extremosCurso.mejor.promedio.toFixed(2)}/20)`
        : "";
    document.getElementById("statPeor").textContent = extremosCurso.peor
        ? `Menor promedio: ${extremosCurso.peor.nombre} (${extremosCurso.peor.promedio.toFixed(2)}/20)`
        : "";

    panel.classList.remove("d-none");
}

function buscarEstudiante() {
    const nombreBusqueda = inputBuscar.value.trim().toLowerCase();
    const resultadoBusqueda = document.getElementById("resultadoBusqueda");

    if (nombreBusqueda === "") {
        resultadoBusqueda.className = "alert alert-warning mt-3";
        resultadoBusqueda.classList.remove("d-none");
        resultadoBusqueda.textContent = "Escribe un nombre para buscar";
        return;
    }

    const estudiante = historialEstudiantes.find(est => est.nombre.toLowerCase() === nombreBusqueda);

    if (estudiante) {
        resultadoBusqueda.className = "alert alert-success mt-3";
        resultadoBusqueda.style.whiteSpace = "pre-line";
        resultadoBusqueda.textContent = `Estudiante encontrado: ${estudiante.nombre}
        Carrera: ${estudiante.carrera}
        Promedio: ${estudiante.promedio.toFixed(2)}/20
        Estado: ${estudiante.estado}
        Rendimiento: ${estudiante.rendimiento}
        Beca: ${estudiante.beca}`;
    } else {
        resultadoBusqueda.className = "alert alert-danger mt-3";
        resultadoBusqueda.textContent = "Estudiante no encontrado";
    }
    resultadoBusqueda.classList.remove("d-none");
}

function limpiarFormulario() {
    document.getElementById("nombre").value = "";
    document.getElementById("carrera").value = "";
    document.getElementById("nota1").value = "";
    document.getElementById("nota2").value = "";
    document.getElementById("nota3").value = "";
    document.getElementById("nota4").value = "";
    document.getElementById("resultado").className = "alert mt-4 d-none";
    document.getElementById("beca").className = "alert mt-4 d-none";
    document.getElementById("salidaJSON").className = "bg-dark text-white p-3 rounded d-none";
    document.getElementById("contenedorTabla").classList.add("d-none");
    document.getElementById("cuerpoTabla").innerHTML = "";
    document.getElementById("contenedorRanking").classList.add("d-none");
    document.getElementById("cuerpoRanking").innerHTML = "";
    document.getElementById("resultadoBusqueda").className = "alert mt-3 d-none";
    document.getElementById("inputBuscar").value = "";
}