"""Explorador de la secuencia de Collatz, sin dependencias externas."""
import json
import sys

MAX_START = 10**18
MAX_STEPS = 10000

def collatz(numero):
    texto = str(numero).strip()
    if not texto.isdigit():
        raise ValueError("invalid")
    n = int(texto)
    if not 1 <= n <= MAX_START:
        raise ValueError("range")

    secuencia = [n]
    while n != 1 and len(secuencia) - 1 < MAX_STEPS:
        n = n // 2 if n % 2 == 0 else 3 * n + 1
        secuencia.append(n)

    if n != 1:
        raise ValueError("limit")

    maximo = max(secuencia)
    return {
        "inicio": str(secuencia[0]),
        "pasos": len(secuencia) - 1,
        "maximo": str(maximo),
        "paso_maximo": secuencia.index(maximo),
        "secuencia": [str(x) for x in secuencia],
    }

def collatz_json(numero):
    try:
        return json.dumps(collatz(numero), ensure_ascii=False)
    except ValueError as error:
        return json.dumps({"error": str(error)})

if __name__ == "__main__" and sys.platform != "emscripten":
    dato = input("Número entero positivo: ")
    try:
        r = collatz(dato)
        print("Pasos:", r["pasos"])
        print("Máximo:", r["maximo"])
        print("Secuencia:", " → ".join(r["secuencia"]))
    except ValueError as error:
        print("Error:", error)
