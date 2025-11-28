import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

const GraphCard = ({
  title,
  description,
  isLoading,
  children,
  empty,
  actions,
}) => {
  return (
    <Card className="h-full border border-gray-100 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base md:text-lg font-semibold text-gray-800">
              {title}
            </CardTitle>
            {description && (
              <p className="text-sm text-gray-500">{description}</p>
            )}
          </div>
          {actions}
        </div>
      </CardHeader>
      <CardContent className="min-h-[280px]">
        {isLoading ? (
          <div className="h-[240px]">
            <Skeleton className="w-full h-full" />
          </div>
        ) : empty ? (
          <div className="h-[240px] flex items-center justify-center text-sm text-gray-500">
            No hay datos por mostrar.
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
};

export default GraphCard;

