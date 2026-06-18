# Guía de Uso de Modelos Claude para Desarrollo de Software

## Objetivo

Esta guía define qué modelo de Claude debe utilizarse según el tipo de tarea para optimizar:

- Calidad de resultados.
- Velocidad de respuesta.
- Consumo de cuota del plan.
- Eficiencia durante el desarrollo.

---

# Modelos Disponibles

## Haiku 4.5

### Descripción

Es el modelo más rápido y económico de Claude.

Está diseñado para tareas simples, repetitivas o de bajo razonamiento.

### Cuándo usarlo

#### Consultas comunes

- Explicación de conceptos.
- Dudas rápidas.
- Comandos de Git.
- Comandos de Linux.
- Errores sencillos.
- Explicaciones de código.

#### Redacción simple

- README.
- Markdowns.
- Documentación técnica básica.
- Correcciones ortográficas.
- Reformulación de texto.

#### Desarrollo simple

- Funciones pequeñas.
- Componentes pequeños.
- Refactorizaciones locales.
- Generación de tipos.
- Generación de interfaces.
- Conversión de formatos.

---

## Sonnet 4.6

### Descripción

Es el modelo recomendado para la mayoría de tareas de desarrollo.

Ofrece la mejor relación entre:

- Inteligencia.
- Velocidad.
- Consumo.

### Cuándo usarlo

- Nuevas funcionalidades.
- Desarrollo frontend.
- Desarrollo backend.
- Integración de APIs.
- Bases de datos.
- Testing.
- Refactorización moderada.
- Comprender documentación.
- Revisar varios archivos.
- Documentación técnica extensa.

---

## Opus 4.8

### Descripción

Es el modelo más potente y costoso.

Debe utilizarse únicamente cuando el problema realmente lo requiera.

### Cuándo usarlo

- Diseño de sistemas complejos.
- Arquitecturas distribuidas.
- Microservicios.
- Bugs que Sonnet no logra resolver.
- Análisis profundo de repositorios grandes.
- Refactorizaciones masivas.
- Programación autónoma extensa.

---

# Recomendaciones por Tipo de Trabajo

| Tipo de tarea | Modelo recomendado |
|--------------|-------------------|
| Consultas comunes | Haiku 4.5 |
| Explicaciones técnicas | Haiku 4.5 |
| README | Haiku 4.5 |
| Markdowns | Haiku 4.5 |
| Componentes pequeños | Haiku 4.5 |
| Desarrollo frontend | Sonnet 4.6 |
| Desarrollo backend | Sonnet 4.6 |
| Integraciones | Sonnet 4.6 |
| Implementación de funcionalidades | Sonnet 4.6 |
| Arquitectura | Opus 4.8 |
| Debugging complejo | Opus 4.8 |
| Refactorizaciones masivas | Opus 4.8 |

---

# Configuración Recomendada

## Uso diario

### 70% de las tareas

Modelo: Sonnet 4.6  
Effort: Low  
Thinking: Off

### 25% de las tareas

Modelo: Haiku 4.5  
Thinking: Off

### 5% de las tareas

Modelo: Opus 4.8  
Effort: Low

---

# Flujo de Escalamiento

Siempre intentar resolver una tarea en el siguiente orden:

Haiku → Sonnet → Opus

No comenzar directamente en Opus salvo que exista una razón clara.

---

# Regla General del Proyecto

Antes de ejecutar cualquier tarea importante, preguntar:

> ¿Qué modelo debería utilizar para esta tarea?

Proporcionar:

1. El prompt completo.
2. El contexto de la tarea.
3. El objetivo esperado.

Con esa información se determinará:

- Modelo recomendado.
- Nivel de esfuerzo recomendado.
- Si vale la pena usar Thinking.
- Si existe una alternativa más económica.

Esto permitirá maximizar la cuota disponible de Claude y utilizar Opus únicamente cuando realmente aporte valor.
