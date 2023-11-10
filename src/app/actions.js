'use server'

export async function helloPython() {
return 'use python'
list_python = ",".join([f"HELLO FROM PYTHON {i}" for i in range(6)])
print(list_python)
}
