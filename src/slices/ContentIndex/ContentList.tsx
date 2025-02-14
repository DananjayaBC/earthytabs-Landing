import { Content } from "@prismicio/client";
import React from "react";

type ContentListProps = {
  items: Content.BlogPostDocument[] | Content.ProductDocument[];
  contentType: Content.ContentIndexSlice["primary"]["content_type"];
  viewMoreText?: Content.ContentIndexSlice["primary"]["view_more_text"];
  fallbackItemImage: Content.ContentIndexSlice["primary"]["fall_back_item_image"];
};

export default function ContentList({
  items,
  contentType,
  viewMoreText = "Read More",
  fallbackItemImage,
}: ContentListProps) {
  return (
    <div>
      <ul>
        {items.map((item, index) => (
          <li key={index}>
            <a href="">
              <div>
                <span>{item.data.title}</span>
                <div></div>
              </div>
              <span>{viewMoreText}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
