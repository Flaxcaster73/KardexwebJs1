// Equivalente en JS de fila.php + tabla.php
// Lee el CSV, agrupa por semestre y calcula promedios

document.addEventListener('DOMContentLoaded', cargarKardex);

async function cargarKardex() {
    const contenedor = document.getElementById('contenedor-kardex');

    try {
        const respuesta = await fetch('./cal/kardex.csv');
        if (!respuesta.ok) throw new Error('No se encontró el archivo CSV.');

        const texto = await respuesta.text();
        const resultado = Papa.parse(texto.trim(), { skipEmptyLines: true });
        const filas = resultado.data;

        // La primera fila son los encabezados, la quitamos
        filas.shift();

        const materiasPorSemestre = {};
        let sumaCalificacionesTotal = 0;
        let cantidadMateriasTotal = 0;

        filas.forEach((fila) => {
            const semestre = fila[1];
            if (!materiasPorSemestre[semestre]) {
                materiasPorSemestre[semestre] = [];
            }
            materiasPorSemestre[semestre].push(fila);

            const calificacion = fila[3];
            if (calificacion !== '' && !isNaN(parseFloat(calificacion))) {
                sumaCalificacionesTotal += parseFloat(calificacion);
                cantidadMateriasTotal++;
            }
        });

        const promedioGeneral = cantidadMateriasTotal > 0
            ? (sumaCalificacionesTotal / cantidadMateriasTotal).toFixed(2)
            : 'N/A';

        contenedor.innerHTML = construirHTML(materiasPorSemestre, promedioGeneral);

    } catch (error) {
        contenedor.innerHTML = '<p>No se encontró el archivo CSV.</p>';
        console.error(error);
    }
}

function construirHTML(materiasPorSemestre, promedioGeneral) {
    let html = `<div class="promedio-general"><h2>Promedio General: ${promedioGeneral}</h2></div>`;

    // Ordenar los semestres numéricamente (1, 2, 3...)
    const semestres = Object.keys(materiasPorSemestre).sort((a, b) => a - b);

    semestres.forEach((semestre) => {
        const materias = materiasPorSemestre[semestre];

        html += `<div id="semestre-${semestre}" class="semestre">`;
        html += `<h2>Semestre ${semestre}</h2>`;
        html += `<div class="table-wrapper"><table>`;
        html += `<thead><tr>`;
        html += `<th>Clave</th><th>Materia</th><th>Periodo</th><th>Forma Eval.</th><th>Calificación</th><th>Estado</th><th>Promedio Semestre</th>`;
        html += `</tr></thead><tbody>`;

        let sumaCalificacionesSemestre = 0;
        let cantidadMateriasSemestre = 0;

        materias.forEach((fila) => {
            html += construirFila(fila);

            const calificacion = fila[3];
            if (calificacion !== '' && !isNaN(parseFloat(calificacion))) {
                sumaCalificacionesSemestre += parseFloat(calificacion);
                cantidadMateriasSemestre++;
            }
        });

        const promedioSemestre = cantidadMateriasSemestre > 0
            ? (sumaCalificacionesSemestre / cantidadMateriasSemestre).toFixed(2)
            : 'N/A';

        html += `<tr><td colspan="6" style="text-align:right;">Promedio Semestre:</td><td>${promedioSemestre}</td></tr>`;
        html += `</tbody></table></div>`;
        html += `</div>`;
    });

    return html;
}

function construirFila(datos) {
    const clave = datos[0];
    const materia = datos[2];
    const periodo = datos[4] || '';
    const formaEvaluacion = datos[5] || '';
    const calificacion = datos[3] || '';
    let estado = datos[6] || 'Sin información';

    if (calificacion === '') {
        estado = 'Sin cursar';
    } else if (parseFloat(calificacion) >= 6) {
        estado = 'Aprobada';
    } else if (parseFloat(calificacion) > 0) {
        estado = 'Reprobada';
    }

    const claseEstado = {
        'Aprobada': 'aprobada',
        'Reprobada': 'reprobada',
        'Sin cursar': 'sin-cursar'
    }[estado] || '';

    return `<tr>
        <td>${clave}</td>
        <td>${materia}</td>
        <td>${periodo}</td>
        <td>${formaEvaluacion}</td>
        <td>${calificacion}</td>
        <td class="${claseEstado}">${estado}</td>
    </tr>`;
}
