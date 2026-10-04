"""Calculadora de subidas y bajadas porcentuales, sin dependencias."""
import json
import math

MAX_VALUE = 10**15
MAX_PERCENT = 10**6

def _numero(valor, error):
    try:
        n = float(str(valor).strip().replace(",", "."))
    except (ValueError, TypeError):
        raise ValueError(error) from None
    if not math.isfinite(n) or n < 0 or n > MAX_VALUE:
        raise ValueError(error)
    return n

def calcular(modo, tipo, valor, porcentaje):
    if modo not in ("desde_inicial", "desde_final"):
        raise ValueError("mode")
    if tipo not in ("subida", "bajada"):
        raise ValueError("type")

    conocido = _numero(valor, "value")
    p = _numero(porcentaje, "percent")
    if p > MAX_PERCENT:
        raise ValueError("percentErr")

    if tipo == "bajada" and p > 100:
        raise ValueError("decrease100")

    factor = 1 + p / 100 if tipo == "subida" else 1 - p / 100

    if modo == "desde_inicial":
        inicial = conocido
        final = inicial * factor
    else:
        if factor == 0:
            raise ValueError("reverse100")
        final = conocido
        inicial = final / factor

    diferencia = final - inicial
    porcentaje_real = 0 if inicial == 0 else diferencia / inicial * 100

    return {
        "modo": modo,
        "tipo": tipo,
        "porcentaje": p,
        "factor": factor,
        "inicial": inicial,
        "final": final,
        "diferencia": diferencia,
        "porcentaje_real": porcentaje_real,
    }

def calcular_json(modo, tipo, valor, porcentaje):
    try:
        return json.dumps(calcular(modo, tipo, valor, porcentaje), allow_nan=False)
    except ValueError as error:
        return json.dumps({"error": str(error)})

if __name__ == "__main__":
    print("Calculadora de porcentajes")
    modo = input("Modo (desde_inicial / desde_final): ").strip()
    tipo = input("Cambio (subida / bajada): ").strip()
    valor = input("Valor conocido: ")
    porcentaje = input("Porcentaje: ")
    try:
        r = calcular(modo, tipo, valor, porcentaje)
        print(f"Inicial: {r['inicial']:.10g}")
        print(f"Final: {r['final']:.10g}")
        print(f"Diferencia: {r['diferencia']:.10g}")
    except ValueError as error:
        print("Error:", error)
