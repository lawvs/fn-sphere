import type {
  APIRoute,
  GetStaticPaths,
  InferGetStaticParamsType,
  InferGetStaticPropsType,
} from "astro";
import { getCollection, getEntry } from "astro:content";

export const GET: APIRoute<Props, Params> = async (context) => {
  const { path } = context.params;

  const doc = await getEntry("docs", path || "index");
  const markdown = `# ${doc?.data.title ?? "Title"}\n\n` + doc?.body;

  return new Response(markdown, {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
    },
  });
};

export const getStaticPaths = (async () => {
  const docs = await getCollection("docs");
  const paths = docs.map((doc) => {
    let path = doc.id.toLowerCase().split(".")[0];
    if (!path) {
      throw new Error("Document path is empty: " + doc.id);
    }
    if (path?.endsWith("index")) {
      path = path.slice(0, -"index".length);
    }
    return {
      params: { path },
    };
  });

  return paths;
}) satisfies GetStaticPaths;

type Props = InferGetStaticPropsType<typeof getStaticPaths>;
type Params = InferGetStaticParamsType<typeof getStaticPaths>;
