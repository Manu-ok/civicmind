import { Metadata, ResolvingMetadata } from "next";
import { getIssue } from "@/lib/firebase/firestore";
import IssueClientPage from "./IssueClientPage";

type Props = {
  params: Promise<{ issueId: string }>;
};

export async function generateMetadata(
  props: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const params = await props.params;
  const issueId = params.issueId;
  const issue = await getIssue(issueId);

  if (!issue) {
    return {
      title: "Issue Not Found - CivicMind",
    };
  }

  const previousImages = (await parent).openGraph?.images || [];
  const imageUrl = (issue.mediaUrls && issue.mediaUrls.length > 0) 
    ? issue.mediaUrls[0] 
    : undefined;

  return {
    title: `${issue.title} | CivicMind`,
    description: `${issue.category.toUpperCase()} issue reported in ${issue.location?.address || issue.location?.ward || 'your city'}.`,
    openGraph: {
      title: issue.title,
      description: `Reported by @${issue.reportedByUsername || 'user'}. Severity: ${issue.severity}. Priority: ${issue.priorityScore || 'N/A'}.`,
      type: "article",
      images: imageUrl ? [imageUrl, ...previousImages] : previousImages,
    },
    twitter: {
      card: "summary_large_image",
      title: issue.title,
      description: `Civic issue reported in ${issue.location?.address || issue.location?.ward || 'your city'}.`,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function Page(props: Props) {
  const params = await props.params;
  return <IssueClientPage issueId={params.issueId} />;
}
