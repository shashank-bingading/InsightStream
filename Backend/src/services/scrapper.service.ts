import axios from "axios";
import * as cheerio from "cheerio";

//interface for scraped article output
export interface ScrappedArticle {
  title: string;
  content: string;
  author?: string | undefined;
  siteName?: string | undefined;
}

export const scrapeArticle = async (url: string): Promise<ScrappedArticle> => {
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      timeout: 10000,
    });

    //data would contain html tags and such
    const html = response.data;
    const $ = cheerio.load(html);

    // Remove scripts, styles, navigation, footers, and ads
    $(
      "script, style, nav, footer, header, iframe, noscript, svg, form",
    ).remove();

    // Extract Title & Metadata
    const title =
      $('meta[property="og:title"]').attr("content") ||
      $("h1").first().text().trim() ||
      $("title").text().trim() ||
      "Untitled Article";

    const author =
      $('meta[name="author"]').attr("content") ||
      $('meta[property="article:author"]').attr("content") ||
      $(".author, .byline").first().text().trim() ||
      undefined;

    const siteName =
      $('meta[property="og:site_name"]').attr("content") || undefined;

    //Extracting Article Paragraphs
    let paragraphs: string[] = [];
    const mainContainer = $(
      "article,main,.post-content,.article-content, .entry-content",
    );

    //ternary operator for if the site dosen't use semantic HTML containers
    const targetElements =
      mainContainer.length > 0 ? mainContainer.find("p") : $("p");

    //Filtering
    targetElements.each((_, element) => {
      const text = $(element).text().trim();
      if (text.length > 20) {
        paragraphs.push(text);
      }
    });

    const content = paragraphs.join("\n\n");

    if (!content) {
      throw new Error("Could not extract readable article text from this URL.");
    }

    return {
      title,
      content,
      author,
      siteName,
    };
  } catch (error: any) {
    console.error(`[Scraper Error] ${url}:`, error.message);
    throw new Error(
      error.response?.status === 404
        ? "Article URL not found (404)."
        : `Failed to scrape article: ${error.message}`,
    );
  }
};
