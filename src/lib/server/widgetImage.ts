import satori from "satori";
import sharp from "sharp";

// Renders the Minecraft theme of the server widget (see
// routes/(content)/servers/[server]/widget/+server.ts) as a PNG, for places
// that can't show an iframe, like Discord embeds. Drawn at 2x so the pixel
// art and font stay sharp.

const SCALE = 2;
const WIDTH = 610 * SCALE;
const HEIGHT = 72 * SCALE;

export type WidgetImageServer = {
    name: string;
    iconUrl: string;
    htmlMotd: string;
    online: boolean;
    onlinePlayers: number;
    maxPlayers: number;
};

export type WidgetImageAssets = {
    font: Buffer;
    boldFont: Buffer;
    // GNU Unifont, Minecraft's own fallback for characters its font lacks
    // (box drawing, dingbats, CJK...). Monocraft has no such fallback, and
    // unlike a browser, satori has no system fonts to fall back on.
    fallbackFont: Buffer;
    // 16x16 menu dirt texture.
    dirt: Buffer;
    // Fallback icon for servers without one.
    noIcon: Buffer;
};

type Node = {
    type: string;
    props: Record<string, unknown> & { style?: Record<string, unknown> };
};

function h(
    type: string,
    style: Record<string, unknown>,
    children?: (Node | string)[] | string,
    props: Record<string, unknown> = {},
): Node {
    return { type, props: { ...props, style, children } };
}

const toDataUri = (png: Buffer) =>
    `data:image/png;base64,${png.toString("base64")}`;

// Minecraft draws text shadows in the text color at a quarter brightness.
function shadowOf(hex: string) {
    const n = parseInt(hex.slice(1), 16);
    const quarter = (shift: number) => ((n >> shift) & 0xff) >> 2;
    return `rgb(${quarter(16)}, ${quarter(8)}, ${quarter(0)})`;
}

function decodeEntities(text: string) {
    return text
        .replace(/&nbsp;/g, " ")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, "&");
}

type Run = { text: string; color: string; bold: boolean; italic: boolean };

// htmlMotd is sanitized at ping time to flat <span style="..."> runs joined
// by <br />, so a small parser is enough.
function parseMotd(html: string): Run[][] {
    return html.split(/<br\s*\/?>/i).map((line) => {
        const runs: Run[] = [];
        const re = /<span style="([^"]*)">([^<]*)<\/span>|<[^>]*>|([^<]+)/g;
        for (const m of line.matchAll(re)) {
            const style = m[1] ?? "";
            // Collapse runs of spaces the way the HTML widget does, so wide
            // padded MOTDs fit.
            const text = decodeEntities(m[2] ?? m[3] ?? "").replace(
                / {2,}/g,
                " ",
            );
            if (!text) continue;
            const color = /color:\s*(#[0-9a-f]{6})/i.exec(style)?.[1];
            runs.push({
                text,
                color: color ?? "#aaaaaa",
                bold: /font-weight:\s*bold/i.test(style),
                italic: /font-style:\s*italic/i.test(style),
            });
        }
        return runs;
    });
}

const text = (run: Run) =>
    h(
        "span",
        {
            color: run.color,
            fontWeight: run.bold ? 700 : 400,
            fontStyle: run.italic ? "italic" : "normal",
            textShadow: `${2 * SCALE}px ${2 * SCALE}px 0 ${shadowOf(run.color)}`,
            whiteSpace: "pre",
        },
        run.text,
    );

let dirtTile: string | undefined;

export async function renderWidgetImage(
    server: WidgetImageServer,
    assets: WidgetImageAssets,
) {
    // Scale pixel art with nearest-neighbour here; the SVG rasterizer would
    // otherwise blur it. The dirt is pre-darkened to menu brightness and
    // tiled so one tile fills the widget's height, like the iframe widget.
    dirtTile ??= toDataUri(
        await sharp(assets.dirt)
            .resize(HEIGHT, HEIGHT, { kernel: "nearest" })
            .linear(0.25, 0)
            .png()
            .toBuffer(),
    );
    const iconMatch = server.iconUrl.match(/^data:image\/png;base64,(.+)$/);
    const icon = toDataUri(
        await sharp(
            iconMatch ? Buffer.from(iconMatch[1], "base64") : assets.noIcon,
        )
            .resize(64 * SCALE, 64 * SCALE, { kernel: "nearest" })
            .png()
            .toBuffer(),
    );

    const motd = server.online
        ? parseMotd(server.htmlMotd)
        : [
              [
                  {
                      text: "Can't connect to server",
                      color: "#aa0000",
                      bold: false,
                      italic: false,
                  },
              ],
          ];

    const lineHeight = 20 * SCALE;
    const bars = [1, 2, 3, 4, 5].map((n) =>
        h("div", {
            width: 2 * SCALE,
            height: (n * 3 + 1) * SCALE,
            background: server.online ? "#55ff55" : "#3f3f3f",
            boxShadow: `${SCALE}px ${SCALE}px 0 #153f15`,
        }),
    );
    const plain = (t: string, color = "#aaaaaa"): Run => ({
        text: t,
        color,
        bold: false,
        italic: false,
    });

    const tree = h(
        "div",
        {
            width: WIDTH,
            height: HEIGHT,
            display: "flex",
            backgroundImage: `url(${dirtTile})`,
            backgroundRepeat: "repeat",
            backgroundSize: `${HEIGHT}px ${HEIGHT}px`,
            fontFamily: "Monocraft",
            fontSize: 18 * SCALE,
            lineHeight: `${lineHeight}px`,
        },
        [
            // Inset with a margin: satori adds padding on top of a fixed
            // width, which pushed the signal bars past the right edge.
            h(
                "div",
                {
                    display: "flex",
                    flexGrow: 1,
                    minWidth: 0,
                    gap: 6 * SCALE,
                    margin: 5 * SCALE,
                },
                [
                    h(
                        "img",
                        { width: 64 * SCALE, height: 64 * SCALE },
                        undefined,
                        {
                            src: icon,
                            width: 64 * SCALE,
                            height: 64 * SCALE,
                        },
                    ),
                    h(
                        "div",
                        {
                            display: "flex",
                            flexDirection: "column",
                            flexGrow: 1,
                            minWidth: 0,
                        },
                        [
                            h("div", { display: "flex", gap: 8 * SCALE }, [
                                h(
                                    "div",
                                    {
                                        flexGrow: 1,
                                        flexShrink: 1,
                                        flexBasis: 0,
                                        minWidth: 0,
                                        color: "#ffffff",
                                        textShadow: `${2 * SCALE}px ${2 * SCALE}px 0 ${shadowOf("#ffffff")}`,
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                    },
                                    server.name,
                                ),
                                h(
                                    "div",
                                    {
                                        display: "flex",
                                        flexShrink: 0,
                                        alignItems: "flex-end",
                                        gap: 6 * SCALE,
                                    },
                                    [
                                        ...(server.online
                                            ? [
                                                  h(
                                                      "div",
                                                      { display: "flex" },
                                                      [
                                                          text(
                                                              plain(
                                                                  `${server.onlinePlayers}`,
                                                              ),
                                                          ),
                                                          text(
                                                              plain(
                                                                  "/",
                                                                  "#555555",
                                                              ),
                                                          ),
                                                          text(
                                                              plain(
                                                                  `${server.maxPlayers}`,
                                                              ),
                                                          ),
                                                      ],
                                                  ),
                                              ]
                                            : []),
                                        h(
                                            "div",
                                            {
                                                display: "flex",
                                                alignItems: "flex-end",
                                                gap: SCALE,
                                                height: 16 * SCALE,
                                                marginBottom: 2 * SCALE,
                                            },
                                            bars,
                                        ),
                                    ],
                                ),
                            ]),
                            h(
                                "div",
                                {
                                    display: "flex",
                                    flexDirection: "column",
                                    height: 2 * lineHeight,
                                    overflow: "hidden",
                                },
                                motd.slice(0, 2).map((line) =>
                                    h(
                                        "div",
                                        {
                                            display: "flex",
                                            overflow: "hidden",
                                        },
                                        line.map(text),
                                    ),
                                ),
                            ),
                        ],
                    ),
                ],
            ),
        ],
    );

    const svg = await satori(tree as Parameters<typeof satori>[0], {
        width: WIDTH,
        height: HEIGHT,
        fonts: [
            { name: "Monocraft", data: assets.font, weight: 400 },
            { name: "Monocraft", data: assets.boldFont, weight: 700 },
            { name: "Unifont", data: assets.fallbackFont, weight: 400 },
        ],
    });
    return sharp(Buffer.from(svg)).png().toBuffer();
}
