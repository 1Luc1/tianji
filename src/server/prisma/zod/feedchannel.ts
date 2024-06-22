import * as z from "zod"
import * as imports from "./schemas"
import { CompleteWorkspace, RelatedWorkspaceModelSchema, CompleteFeedEvent, RelatedFeedEventModelSchema } from "./index"

export const FeedChannelModelSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompleteFeedChannel extends z.infer<typeof FeedChannelModelSchema> {
  workspace: CompleteWorkspace
  events: CompleteFeedEvent[]
}

/**
 * RelatedFeedChannelModelSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedFeedChannelModelSchema: z.ZodSchema<CompleteFeedChannel> = z.lazy(() => FeedChannelModelSchema.extend({
  workspace: RelatedWorkspaceModelSchema,
  events: RelatedFeedEventModelSchema.array(),
}))
