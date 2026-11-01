import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageContainer } from "@/components/layouts/page-container";
import { PageHeader } from "@/components/layouts/page-header";

type PagePlaceholderProps = {
  title: string;
  description?: string;
};

export default function PagePlaceholder({
  title,
  description = "This workspace is reserved for a later implementation phase.",
}: PagePlaceholderProps) {
  return (
    <PageContainer>
      <PageHeader description={description} eyebrow="Foundation preview" title={title} />
      <Card>
        <CardContent className="flex min-h-56 flex-col items-center justify-center p-8 text-center sm:p-12">
          <Badge variant="neutral">Planned for a future phase</Badge>
          <h2 className="mt-4 text-lg font-semibold">Foundation route ready</h2>
          <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
            Navigation, responsive layout, and shared design tokens are active. No business
            workflows or API requests are implemented on this screen.
          </p>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
