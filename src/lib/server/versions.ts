// Parses the free-form version strings servers report ("Paper 1.21.11",
// "Velocity 1.7.2-26.3", "BungeeCord 1.8.x-26.x", "1.21.10+") into the
// release versions they support, for the version filter on /servers/.
//
// Versions are compared at the release level: "1.21" (old scheme) or "26.2"
// (year-based scheme). Patch numbers are ignored.

type Release = { major: number; minor: number | null }; // minor null = "26.x"
type Span = [from: number, to: number];

const RELEASE = /\b(1|[2-9]\d)\.(\d+|x)(?:\.(?:\d+|x))*(\+)?/gi;
// Text allowed between two versions for them to form a range.
const RANGE_SEPARATOR = /^\s*(?:-|–|to|a)\s*$/i;

// Orders releases across both schemes: 1.21 < 26.1.
const ordinal = (major: number, minor: number) =>
    major === 1 ? minor : major * 100 + minor;

export const releaseLabel = (major: number, minor: number) =>
    `${major}.${minor}`;

function parseLabel(label: string): [number, number] | null {
    const match = /^(\d+)\.(\d+)$/.exec(label);
    return match ? [Number(match[1]), Number(match[2])] : null;
}

// Every release a version string mentions, with each mention's position.
function mentions(versionString: string) {
    return [...versionString.matchAll(RELEASE)].map((match) => {
        const major = Number(match[1]);
        const minor = match[2].toLowerCase() === "x" ? null : Number(match[2]);
        return {
            release: { major, minor } satisfies Release,
            plus: !!match[3],
            start: match.index,
            end: match.index + match[0].length,
        };
    });
}

// The ordinal spans a version string supports. "26.x" covers all of 26,
// "1.21.10+" covers 1.21 and everything after.
export function supportedSpans(versionString: string): Span[] {
    const found = mentions(versionString);
    const lowest = ({ major, minor }: Release) => ordinal(major, minor ?? 0);
    const highest = ({ major, minor }: Release) => ordinal(major, minor ?? 99);

    const spans: Span[] = [];
    for (let i = 0; i < found.length; i++) {
        const current = found[i];
        const next = found[i + 1];
        if (
            next &&
            RANGE_SEPARATOR.test(versionString.slice(current.end, next.start))
        ) {
            spans.push([
                lowest(current.release),
                next.plus ? Infinity : highest(next.release),
            ]);
            i++;
        } else {
            spans.push([
                lowest(current.release),
                current.plus ? Infinity : highest(current.release),
            ]);
        }
    }
    return spans;
}

export function supportsRelease(versionString: string, label: string) {
    const release = parseLabel(label);
    if (!release) return false;
    const target = ordinal(...release);
    return supportedSpans(versionString).some(
        ([from, to]) => from <= target && target <= to,
    );
}

// Filter options: every release from the lowest to the highest mentioned in
// each scheme (1.x and each year), newest first.
export function releaseOptions(versionStrings: string[]) {
    const minors = new Map<number, number[]>();
    for (const versionString of versionStrings) {
        for (const { release } of mentions(versionString)) {
            if (release.minor === null) continue;
            const list = minors.get(release.major) ?? [];
            list.push(release.minor);
            minors.set(release.major, list);
        }
    }
    const options: string[] = [];
    for (const [major, list] of minors) {
        // Year-based releases start at .1; 1.x starts where servers do.
        const first = major === 1 ? Math.min(...list) : 1;
        for (let m = first; m <= Math.max(...list); m++) {
            options.push(releaseLabel(major, m));
        }
    }
    return options.sort((a, b) => {
        const [aMajor, aMinor] = parseLabel(a)!;
        const [bMajor, bMinor] = parseLabel(b)!;
        return ordinal(bMajor, bMinor) - ordinal(aMajor, aMinor);
    });
}
