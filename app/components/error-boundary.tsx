import {
  isRouteErrorResponse,
  useParams,
  useRouteError,
} from "@remix-run/react";
import type { ErrorResponse } from "@remix-run/router";
import { getErrorMessage } from "~/utils/misc";

type StatusHandler = (info: {
  error: ErrorResponse;
  params: Record<string, string | undefined>;
}) => JSX.Element | null;

export function GeneralErrorBoundary({
  defaultStatusHandler = ({ error }) => (
    <p>
      {error.status} {error.data}
    </p>
  ),
  statusHandlers,
  unexpectedErrorHandler = (error) => <p>{getErrorMessage(error)}</p>,
}: {
  defaultStatusHandler?: StatusHandler;
  statusHandlers?: Record<number, StatusHandler>;
  unexpectedErrorHandler?: (error: unknown) => JSX.Element | null;
}) {
  const error = useRouteError();
  const params = useParams();

  if (typeof document !== "undefined") {
    console.error(error);
  }

  return (
    <div className="">
      {isRouteErrorResponse(error)
        ? (statusHandlers?.[error.status] ?? defaultStatusHandler)({
            error,
            params,
          })
        : unexpectedErrorHandler(error)}
    </div>
  );
}
