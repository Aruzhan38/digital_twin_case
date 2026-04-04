from fastapi import FastAPI


# Run with: uvicorn main:app --reload
app = FastAPI(title="Digital Twin Backend")


@app.get("/")
def read_root() -> dict[str, str]:
    return {"message": "Backend is running"}
