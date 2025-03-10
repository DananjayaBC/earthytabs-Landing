import { FC } from "react";
import { Content, isFilled } from "@prismicio/client";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";
import Bounded from "@/components/Bounded";
import Heading from "@/components/Heading";
import ContentList from "./ContentList";
import { createClient } from "@/prismicio";

/**
 * Props for `ContentIndex`.
 */
export type ContentIndexProps = SliceComponentProps<Content.ContentIndexSlice>;

/**
 * Component for "ContentIndex" Slices.
 */
const ContentIndex: FC<ContentIndexProps> = async ({ slice }) => {
  const client = createClient();
  const blogPosts = await client.getAllByType("blog_post");
  const products = await client.getAllByType("product");

  const contentType = slice.primary.content_type || "Blog";

  const items = contentType === "Blog" ? blogPosts : products;

  return (
    <Bounded
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      <section className="px-4 py-10 md:px-6 md:py-14 lg:py-16">
        <Heading size="xl" className="mb-8">
          {slice.primary.heading}
        </Heading>
        {isFilled.richText(slice.primary.description) && (
          <div className="prose prose-xl prose-invert mb-10">
            <PrismicRichText field={slice.primary.description} />
          </div>
        )}
        <ContentList
          items={items}
          contentType={contentType}
          viewMoreText={slice.primary.view_more_text}
          fallbackItemImage={slice.primary.fall_back_item_image}
        />
      </section>
    </Bounded>
  );
};

export default ContentIndex;
