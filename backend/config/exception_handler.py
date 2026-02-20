from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        error_data = {
            "error": True,
            "message": _extract_message(response.data),
            "code": _status_to_code(response.status_code),
        }
        response.data = error_data

    return response


def _extract_message(data):
    if isinstance(data, dict):
        if "detail" in data:
            return str(data["detail"])
        messages = []
        for key, value in data.items():
            if isinstance(value, list):
                messages.append(f"{key}: {', '.join(str(v) for v in value)}")
            else:
                messages.append(f"{key}: {value}")
        return "; ".join(messages)
    if isinstance(data, list):
        return "; ".join(str(item) for item in data)
    return str(data)


def _status_to_code(status_code):
    codes = {
        400: "VALIDATION_ERROR",
        404: "NOT_FOUND",
        405: "METHOD_NOT_ALLOWED",
        500: "SERVER_ERROR",
        502: "PAYMENT_PROCESSOR_ERROR",
    }
    return codes.get(status_code, "ERROR")
