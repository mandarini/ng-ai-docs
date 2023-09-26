import { createClient } from '@supabase/supabase-js';
import { readFile } from 'fs/promises';
import 'openai';
import OpenAI from 'openai';
import yargs from 'yargs';
import { createHash } from 'crypto';
import GithubSlugger from 'github-slugger';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { toMarkdown } from 'mdast-util-to-markdown';
import { toString } from 'mdast-util-to-string';
import { u } from 'unist-builder';
// import files from './assets/files.json' assert { type: 'json' };
import { config as loadDotEnvFile } from 'dotenv';
import { expand } from 'dotenv-expand';

type ProcessedMdx = {
  checksum: string;
  sections: Section[];
};

type Section = {
  content: string;
  heading?: string;
  slug?: string;
};

const myEnv = loadDotEnvFile();
expand(myEnv);

const files = [
  'documentation/create-embeddings/docs/NG0100.md',
  'documentation/create-embeddings/docs/NG01101.md',
  'documentation/create-embeddings/docs/NG01203.md',
  'documentation/create-embeddings/docs/NG0200.md',
  'documentation/create-embeddings/docs/NG0201.md',
  'documentation/create-embeddings/docs/NG0203.md',
  'documentation/create-embeddings/docs/NG0209.md',
  'documentation/create-embeddings/docs/NG02200.md',
  'documentation/create-embeddings/docs/NG02800.md',
  'documentation/create-embeddings/docs/NG0300.md',
  'documentation/create-embeddings/docs/NG0301.md',
  'documentation/create-embeddings/docs/NG0302.md',
  'documentation/create-embeddings/docs/NG0403.md',
  'documentation/create-embeddings/docs/NG0500.md',
  'documentation/create-embeddings/docs/NG0501.md',
  'documentation/create-embeddings/docs/NG0502.md',
  'documentation/create-embeddings/docs/NG0503.md',
  'documentation/create-embeddings/docs/NG0504.md',
  'documentation/create-embeddings/docs/NG0505.md',
  'documentation/create-embeddings/docs/NG0506.md',
  'documentation/create-embeddings/docs/NG0507.md',
  'documentation/create-embeddings/docs/NG05104.md',
  'documentation/create-embeddings/docs/NG0910.md',
  'documentation/create-embeddings/docs/NG0912.md',
  'documentation/create-embeddings/docs/NG1001.md',
  'documentation/create-embeddings/docs/NG2003.md',
  'documentation/create-embeddings/docs/NG2009.md',
  'documentation/create-embeddings/docs/NG3003.md',
  'documentation/create-embeddings/docs/NG5000.md',
  'documentation/create-embeddings/docs/NG6100.md',
  'documentation/create-embeddings/docs/NG8001.md',
  'documentation/create-embeddings/docs/NG8002.md',
  'documentation/create-embeddings/docs/NG8003.md',
  'documentation/create-embeddings/docs/NG8101.md',
  'documentation/create-embeddings/docs/NG8102.md',
  'documentation/create-embeddings/docs/NG8103.md',
  'documentation/create-embeddings/docs/NG8104.md',
  'documentation/create-embeddings/docs/NG8105.md',
  'documentation/create-embeddings/docs/NG8106.md',
  'documentation/create-embeddings/docs/NG8107.md',
  'documentation/create-embeddings/docs/NG8108.md',
  'documentation/create-embeddings/docs/README.md',
  'documentation/create-embeddings/docs/accessibility.md',
  'documentation/create-embeddings/docs/add-an-animation.md',
  'documentation/create-embeddings/docs/ajs-quick-reference.md',
  'documentation/create-embeddings/docs/angular-compiler-options.md',
  'documentation/create-embeddings/docs/angular-package-format.md',
  'documentation/create-embeddings/docs/animate-state-style.md',
  'documentation/create-embeddings/docs/animation-api-summary.md',
  'documentation/create-embeddings/docs/animation-transition-timing.md',
  'documentation/create-embeddings/docs/animations-attach-to-html-template.md',
  'documentation/create-embeddings/docs/animations.md',
  'documentation/create-embeddings/docs/aot-compiler.md',
  'documentation/create-embeddings/docs/aot-metadata-errors.md',
  'documentation/create-embeddings/docs/app-shell.md',
  'documentation/create-embeddings/docs/architecture-components.md',
  'documentation/create-embeddings/docs/architecture-modules.md',
  'documentation/create-embeddings/docs/architecture-next-steps.md',
  'documentation/create-embeddings/docs/architecture-services.md',
  'documentation/create-embeddings/docs/architecture.md',
  'documentation/create-embeddings/docs/attribute-binding.md',
  'documentation/create-embeddings/docs/attribute-directives.md',
  'documentation/create-embeddings/docs/binding-overview.md',
  'documentation/create-embeddings/docs/binding-syntax.md',
  'documentation/create-embeddings/docs/bootstrapping.md',
  'documentation/create-embeddings/docs/browser-support.md',
  'documentation/create-embeddings/docs/build.md',
  'documentation/create-embeddings/docs/built-in-directives.md',
  'documentation/create-embeddings/docs/change-detection-skipping-subtrees.md',
  'documentation/create-embeddings/docs/change-detection-slow-computations.md',
  'documentation/create-embeddings/docs/change-detection-zone-pollution.md',
  'documentation/create-embeddings/docs/change-detection.md',
  'documentation/create-embeddings/docs/cheatsheet.md',
  'documentation/create-embeddings/docs/class-binding.md',
  'documentation/create-embeddings/docs/cli-builder.md',
  'documentation/create-embeddings/docs/comparing-observables.md',
  'documentation/create-embeddings/docs/complex-animation-sequences.md',
  'documentation/create-embeddings/docs/component-interaction.md',
  'documentation/create-embeddings/docs/component-overview.md',
  'documentation/create-embeddings/docs/component-styles.md',
  'documentation/create-embeddings/docs/content-projection.md',
  'documentation/create-embeddings/docs/contributors-guide-overview.md',
  'documentation/create-embeddings/docs/creating-injectable-service.md',
  'documentation/create-embeddings/docs/creating-libraries.md',
  'documentation/create-embeddings/docs/dependency-injection-context.md',
  'documentation/create-embeddings/docs/dependency-injection-in-action.md',
  'documentation/create-embeddings/docs/dependency-injection-navtree.md',
  'documentation/create-embeddings/docs/dependency-injection-overview.md',
  'documentation/create-embeddings/docs/dependency-injection-providers.md',
  'documentation/create-embeddings/docs/dependency-injection.md',
  'documentation/create-embeddings/docs/deployment.md',
  'documentation/create-embeddings/docs/deprecations.md',
  'documentation/create-embeddings/docs/developer-guide-overview.md',
  'documentation/create-embeddings/docs/devtools.md',
  'documentation/create-embeddings/docs/directive-composition-api.md',
  'documentation/create-embeddings/docs/doc-build-test.md',
  'documentation/create-embeddings/docs/doc-edit-finish.md',
  'documentation/create-embeddings/docs/doc-editing.md',
  'documentation/create-embeddings/docs/doc-github-tasks.md',
  'documentation/create-embeddings/docs/doc-pr-open.md',
  'documentation/create-embeddings/docs/doc-pr-prep.md',
  'documentation/create-embeddings/docs/doc-pr-update.md',
  'documentation/create-embeddings/docs/doc-prepare-to-edit.md',
  'documentation/create-embeddings/docs/doc-select-issue.md',
  'documentation/create-embeddings/docs/doc-tasks.md',
  'documentation/create-embeddings/docs/doc-update-overview.md',
  'documentation/create-embeddings/docs/doc-update-start.md',
  'documentation/create-embeddings/docs/docs-lint-errors.md',
  'documentation/create-embeddings/docs/docs-style-guide.md',
  'documentation/create-embeddings/docs/docs.md',
  'documentation/create-embeddings/docs/dynamic-component-loader.md',
  'documentation/create-embeddings/docs/dynamic-form.md',
  'documentation/create-embeddings/docs/elements.md',
  'documentation/create-embeddings/docs/esbuild.md',
  'documentation/create-embeddings/docs/event-binding-concepts.md',
  'documentation/create-embeddings/docs/event-binding.md',
  'documentation/create-embeddings/docs/events-contributing.md',
  'documentation/create-embeddings/docs/everyone.md',
  'documentation/create-embeddings/docs/example-apps-list.md',
  'documentation/create-embeddings/docs/feature-modules.md',
  'documentation/create-embeddings/docs/file-not-found.md',
  'documentation/create-embeddings/docs/file-structure.md',
  'documentation/create-embeddings/docs/first-app-lesson-01.md',
  'documentation/create-embeddings/docs/first-app-lesson-02.md',
  'documentation/create-embeddings/docs/first-app-lesson-03.md',
  'documentation/create-embeddings/docs/first-app-lesson-04.md',
  'documentation/create-embeddings/docs/first-app-lesson-05.md',
  'documentation/create-embeddings/docs/first-app-lesson-06.md',
  'documentation/create-embeddings/docs/first-app-lesson-07.md',
  'documentation/create-embeddings/docs/first-app-lesson-08.md',
  'documentation/create-embeddings/docs/first-app-lesson-09.md',
  'documentation/create-embeddings/docs/first-app-lesson-10.md',
  'documentation/create-embeddings/docs/first-app-lesson-11.md',
  'documentation/create-embeddings/docs/first-app-lesson-12.md',
  'documentation/create-embeddings/docs/first-app-lesson-13.md',
  'documentation/create-embeddings/docs/first-app-lesson-14.md',
  'documentation/create-embeddings/docs/form-validation.md',
  'documentation/create-embeddings/docs/forms-overview.md',
  'documentation/create-embeddings/docs/forms.md',
  'documentation/create-embeddings/docs/frequent-ngmodules.md',
  'documentation/create-embeddings/docs/glossary.md',
  'documentation/create-embeddings/docs/hierarchical-dependency-injection.md',
  'documentation/create-embeddings/docs/http-configure-http-url-parameters.md',
  'documentation/create-embeddings/docs/http-handle-request-errors.md',
  'documentation/create-embeddings/docs/http-intercept-requests-and-responses.md',
  'documentation/create-embeddings/docs/http-interceptor-use-cases.md',
  'documentation/create-embeddings/docs/http-make-jsonp-request.md',
  'documentation/create-embeddings/docs/http-optimize-server-interaction.md',
  'documentation/create-embeddings/docs/http-pass-metadata-to-interceptors.md',
  'documentation/create-embeddings/docs/http-request-data-from-server.md',
  'documentation/create-embeddings/docs/http-security-xsrf-protection.md',
  'documentation/create-embeddings/docs/http-send-data-to-server.md',
  'documentation/create-embeddings/docs/http-server-communication.md',
  'documentation/create-embeddings/docs/http-setup-server-communication.md',
  'documentation/create-embeddings/docs/http-test-requests.md',
  'documentation/create-embeddings/docs/http-track-show-request-progress.md',
  'documentation/create-embeddings/docs/hydration.md',
  'documentation/create-embeddings/docs/i18n-common-add-package.md',
  'documentation/create-embeddings/docs/i18n-common-deploy.md',
  'documentation/create-embeddings/docs/i18n-common-format-data-locale.md',
  'documentation/create-embeddings/docs/i18n-common-locale-id.md',
  'documentation/create-embeddings/docs/i18n-common-merge.md',
  'documentation/create-embeddings/docs/i18n-common-overview.md',
  'documentation/create-embeddings/docs/i18n-common-prepare.md',
  'documentation/create-embeddings/docs/i18n-common-translation-files.md',
  'documentation/create-embeddings/docs/i18n-example.md',
  'documentation/create-embeddings/docs/i18n-optional-import-global-variants.md',
  'documentation/create-embeddings/docs/i18n-optional-manage-marked-text.md',
  'documentation/create-embeddings/docs/i18n-optional-manual-runtime-locale.md',
  'documentation/create-embeddings/docs/i18n-optional-overview.md',
  'documentation/create-embeddings/docs/i18n-overview.md',
  'documentation/create-embeddings/docs/image-directive.md',
  'documentation/create-embeddings/docs/index.md',
  'documentation/create-embeddings/docs/inputs-outputs.md',
  'documentation/create-embeddings/docs/interpolation.md',
  'documentation/create-embeddings/docs/language-service.md',
  'documentation/create-embeddings/docs/lazy-loading-ngmodules.md',
  'documentation/create-embeddings/docs/libraries.md',
  'documentation/create-embeddings/docs/license.md',
  'documentation/create-embeddings/docs/lifecycle-hooks.md',
  'documentation/create-embeddings/docs/lightweight-injection-tokens.md',
  'documentation/create-embeddings/docs/localized-documentation.md',
  'documentation/create-embeddings/docs/localizing-angular.md',
  'documentation/create-embeddings/docs/migration-module-with-providers.md',
  'documentation/create-embeddings/docs/module-types.md',
  'documentation/create-embeddings/docs/ng-container.md',
  'documentation/create-embeddings/docs/ng-content.md',
  'documentation/create-embeddings/docs/ng-template.md',
  'documentation/create-embeddings/docs/ngmodule-api.md',
  'documentation/create-embeddings/docs/ngmodule-faq.md',
  'documentation/create-embeddings/docs/ngmodule-vs-jsmodule.md',
  'documentation/create-embeddings/docs/ngmodules.md',
  'documentation/create-embeddings/docs/npm-packages.md',
  'documentation/create-embeddings/docs/observables-in-angular.md',
  'documentation/create-embeddings/docs/observables.md',
  'documentation/create-embeddings/docs/pipe-precedence.md',
  'documentation/create-embeddings/docs/pipe-template.md',
  'documentation/create-embeddings/docs/pipes-custom-data-trans.md',
  'documentation/create-embeddings/docs/pipes-overview.md',
  'documentation/create-embeddings/docs/pipes-transform-data.md',
  'documentation/create-embeddings/docs/pipes.md',
  'documentation/create-embeddings/docs/practical-observable-usage.md',
  'documentation/create-embeddings/docs/prerendering.md',
  'documentation/create-embeddings/docs/property-binding-best-practices.md',
  'documentation/create-embeddings/docs/property-binding.md',
  'documentation/create-embeddings/docs/providers.md',
  'documentation/create-embeddings/docs/quick-start.md',
  'documentation/create-embeddings/docs/reactive-forms.md',
  'documentation/create-embeddings/docs/releases.md',
  'documentation/create-embeddings/docs/resources-contributing.md',
  'documentation/create-embeddings/docs/reusable-animations.md',
  'documentation/create-embeddings/docs/reviewing-content.md',
  'documentation/create-embeddings/docs/roadmap.md',
  'documentation/create-embeddings/docs/route-animations.md',
  'documentation/create-embeddings/docs/router-reference.md',
  'documentation/create-embeddings/docs/router-tutorial-toh.md',
  'documentation/create-embeddings/docs/router-tutorial.md',
  'documentation/create-embeddings/docs/router.md',
  'documentation/create-embeddings/docs/routing-overview.md',
  'documentation/create-embeddings/docs/routing-with-urlmatcher.md',
  'documentation/create-embeddings/docs/rx-library.md',
  'documentation/create-embeddings/docs/rxjs-interop.md',
  'documentation/create-embeddings/docs/scaling.md',
  'documentation/create-embeddings/docs/schematics-authoring.md',
  'documentation/create-embeddings/docs/schematics-for-libraries.md',
  'documentation/create-embeddings/docs/schematics.md',
  'documentation/create-embeddings/docs/security.md',
  'documentation/create-embeddings/docs/service-worker-communications.md',
  'documentation/create-embeddings/docs/service-worker-config.md',
  'documentation/create-embeddings/docs/service-worker-devops.md',
  'documentation/create-embeddings/docs/service-worker-getting-started.md',
  'documentation/create-embeddings/docs/service-worker-intro.md',
  'documentation/create-embeddings/docs/service-worker-notifications.md',
  'documentation/create-embeddings/docs/setup-local.md',
  'documentation/create-embeddings/docs/sharing-ngmodules.md',
  'documentation/create-embeddings/docs/signals.md',
  'documentation/create-embeddings/docs/singleton-services.md',
  'documentation/create-embeddings/docs/standalone-components.md',
  'documentation/create-embeddings/docs/standalone-migration.md',
  'documentation/create-embeddings/docs/start-data.md',
  'documentation/create-embeddings/docs/start-deployment.md',
  'documentation/create-embeddings/docs/start-forms.md',
  'documentation/create-embeddings/docs/start-routing.md',
  'documentation/create-embeddings/docs/static-query-migration.md',
  'documentation/create-embeddings/docs/strict-mode.md',
  'documentation/create-embeddings/docs/structural-directives.md',
  'documentation/create-embeddings/docs/style-precedence.md',
  'documentation/create-embeddings/docs/styleguide.md',
  'documentation/create-embeddings/docs/svg-in-templates.md',
  'documentation/create-embeddings/docs/template-expression-operators.md',
  'documentation/create-embeddings/docs/template-overview.md',
  'documentation/create-embeddings/docs/template-reference-variables.md',
  'documentation/create-embeddings/docs/template-statements.md',
  'documentation/create-embeddings/docs/template-syntax.md',
  'documentation/create-embeddings/docs/template-typecheck.md',
  'documentation/create-embeddings/docs/test-debugging.md',
  'documentation/create-embeddings/docs/testing-attribute-directives.md',
  'documentation/create-embeddings/docs/testing-code-coverage.md',
  'documentation/create-embeddings/docs/testing-components-basics.md',
  'documentation/create-embeddings/docs/testing-components-scenarios.md',
  'documentation/create-embeddings/docs/testing-pipes.md',
  'documentation/create-embeddings/docs/testing-services.md',
  'documentation/create-embeddings/docs/testing-utility-apis.md',
  'documentation/create-embeddings/docs/testing.md',
  'documentation/create-embeddings/docs/toh-pt0.md',
  'documentation/create-embeddings/docs/toh-pt1.md',
  'documentation/create-embeddings/docs/toh-pt2.md',
  'documentation/create-embeddings/docs/toh-pt3.md',
  'documentation/create-embeddings/docs/toh-pt4.md',
  'documentation/create-embeddings/docs/toh-pt5.md',
  'documentation/create-embeddings/docs/toh-pt6.md',
  'documentation/create-embeddings/docs/transition-and-triggers.md',
  'documentation/create-embeddings/docs/tutorial-template.md',
  'documentation/create-embeddings/docs/two-way-binding.md',
  'documentation/create-embeddings/docs/typed-forms.md',
  'documentation/create-embeddings/docs/typescript-configuration.md',
  'documentation/create-embeddings/docs/understanding-angular-animation.md',
  'documentation/create-embeddings/docs/understanding-angular-overview.md',
  'documentation/create-embeddings/docs/understanding-communicating-with-http.md',
  'documentation/create-embeddings/docs/understanding-template-expr-overview.md',
  'documentation/create-embeddings/docs/universal-ngmodule.md',
  'documentation/create-embeddings/docs/universal.md',
  'documentation/create-embeddings/docs/update-to-version-14.md',
  'documentation/create-embeddings/docs/update-to-version-15.md',
  'documentation/create-embeddings/docs/update-to-version-16.md',
  'documentation/create-embeddings/docs/updating-content-github-ui.md',
  'documentation/create-embeddings/docs/updating-search-keywords.md',
  'documentation/create-embeddings/docs/updating.md',
  'documentation/create-embeddings/docs/upgrade-performance.md',
  'documentation/create-embeddings/docs/upgrade-setup.md',
  'documentation/create-embeddings/docs/upgrade.md',
  'documentation/create-embeddings/docs/user-input.md',
  'documentation/create-embeddings/docs/using-libraries.md',
  'documentation/create-embeddings/docs/versions.md',
  'documentation/create-embeddings/docs/view-encapsulation.md',
  'documentation/create-embeddings/docs/web-worker.md',
  'documentation/create-embeddings/docs/what-is-angular.md',
  'documentation/create-embeddings/docs/workspace-config.md',
  'documentation/create-embeddings/docs/zone.md',
];

/**
 * Splits a `mdast` tree into multiple trees based on
 * a predicate function. Will include the splitting node
 * at the beginning of each tree.
 *
 * Useful to split a markdown file into smaller sections.
 */
export function splitTreeBy(tree: any, predicate: (node: any) => boolean) {
  return tree.children.reduce((trees: any, node: any) => {
    const [lastTree] = trees.slice(-1);

    if (!lastTree || predicate(node)) {
      const tree = u('root', [node]);
      return trees.concat(tree);
    }

    lastTree.children.push(node);
    return trees;
  }, []);
}

/**
 * Processes MD content for search indexing.
 * It extracts metadata and splits it into sub-sections based on criteria.
 */
export function processMdxForSearch(content: string): ProcessedMdx {
  const checksum = createHash('sha256').update(content).digest('base64');

  const mdTree = fromMarkdown(content, {});

  if (!mdTree) {
    return {
      checksum,
      sections: [],
    };
  }

  const sectionTrees = splitTreeBy(mdTree, (node) => node.type === 'heading');

  const slugger = new GithubSlugger();

  const sections = sectionTrees.map((tree: any) => {
    const [firstNode] = tree.children;

    const heading =
      firstNode.type === 'heading' ? toString(firstNode) : undefined;
    const slug = heading ? slugger.slug(heading) : undefined;

    return {
      content: toMarkdown(tree),
      heading,
      slug,
    };
  });

  return {
    checksum,
    sections,
  };
}

type WalkEntry = {
  path: string;
};

abstract class BaseEmbeddingSource {
  checksum?: string;
  sections?: Section[];

  constructor(public source: string, public path: string) {}

  abstract load(): Promise<{
    checksum: string;
    sections: Section[];
  }>;
}

class MarkdownEmbeddingSource extends BaseEmbeddingSource {
  type: 'markdown' = 'markdown';

  constructor(
    source: string,
    public filePath: string,
    public fileContent?: string
  ) {
    const path = filePath.replace(/^docs/, '').replace(/\.md?$/, '');
    super(source, path);
  }

  async load() {
    const contents =
      this.fileContent ?? (await readFile(this.filePath, 'utf8'));

    const { checksum, sections } = processMdxForSearch(contents);

    this.checksum = checksum;
    this.sections = sections;

    return {
      checksum,
      sections,
    };
  }
}

type EmbeddingSource = MarkdownEmbeddingSource;

async function generateEmbeddings() {
  const argv = await yargs().option('refresh', {
    alias: 'r',
    description: 'Refresh data',
    type: 'boolean',
  }).argv;

  const shouldRefresh = argv.refresh;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error(
      'Environment variable NEXT_PUBLIC_SUPABASE_URL is required: skipping embeddings generation'
    );
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      'Environment variable SUPABASE_SERVICE_ROLE_KEY is required: skipping embeddings generation'
    );
  }

  if (!process.env.OPENAI_KEY) {
    throw new Error(
      'Environment variable OPENAI_KEY is required: skipping embeddings generation'
    );
  }

  const supabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  const embeddingSources: EmbeddingSource[] = [
    ...files.map((entry) => {
      return new MarkdownEmbeddingSource('guide', entry);
    }),
  ];

  console.log(`Discovered ${embeddingSources.length} pages`);

  if (!shouldRefresh) {
    console.log('Checking which pages are new or have changed');
  } else {
    console.log('Refresh flag set, re-generating all pages');
  }

  for (const [index, embeddingSource] of embeddingSources.entries()) {
    const { type, source, path } = embeddingSource;

    try {
      const { checksum, sections } = await embeddingSource.load();

      // Check for existing page in DB and compare checksums
      const { error: fetchPageError, data: existingPage } = await supabaseClient
        .from('nods_page')
        .select('id, path, checksum')
        .filter('path', 'eq', path)
        .limit(1)
        .maybeSingle();

      if (fetchPageError) {
        // throw fetchPageError
      }

      // We use checksum to determine if this page & its sections need to be regenerated
      if (!shouldRefresh && existingPage?.checksum === checksum) {
        continue;
      }

      if (existingPage) {
        if (!shouldRefresh) {
          console.log(
            `#${index}: [${path}] Docs have changed, removing old page sections and their embeddings`
          );
        } else {
          console.log(
            `#${index}: [${path}] Refresh flag set, removing old page sections and their embeddings`
          );
        }

        const { error: deletePageSectionError } = await supabaseClient
          .from('nods_page_section')
          .delete()
          .filter('page_id', 'eq', existingPage.id);

        if (deletePageSectionError) {
          throw deletePageSectionError;
        }
      }

      // Create/update page record. Intentionally clear checksum until we
      // have successfully generated all page sections.
      const { error: upsertPageError, data: page } = await supabaseClient
        .from('nods_page')
        .upsert(
          {
            checksum: null,
            path,
            type,
            source,
          },
          { onConflict: 'path' }
        )
        .select()
        .limit(1)
        .single();

      if (upsertPageError) {
        throw upsertPageError;
      }

      console.log(
        `#${index}: [${path}] Adding ${sections.length} page sections (with embeddings)`
      );
      console.log(
        `${embeddingSources.length - index - 1} pages remaining to process.`
      );

      for (const { slug, heading, content } of sections) {
        // OpenAI recommends replacing newlines with spaces for best results (specific to embeddings)
        const input = content.replace(/\n/g, ' ');

        try {
          const openai = new OpenAI({
            apiKey: process.env.OPENAI_KEY,
          });
          const embeddingResponse = await openai.embeddings.create({
            model: 'text-embedding-ada-002',
            input,
          });

          const [responseData] = embeddingResponse.data;

          const { error: insertPageSectionError, data: pageSection } =
            await supabaseClient
              .from('nods_page_section')
              .insert({
                page_id: page.id,
                slug,
                heading,

                content,

                token_count: embeddingResponse.usage.total_tokens,
                embedding: responseData.embedding,
              })
              .select()
              .limit(1)
              .single();

          if (insertPageSectionError) {
            throw insertPageSectionError;
          }

          // Add delay after each request
          await delay(500); // delay of 0.5 second
        } catch (err) {
          // TODO: decide how to better handle failed embeddings
          console.error(
            `Failed to generate embeddings for '${path}' page section starting with '${input.slice(
              0,
              40
            )}...'`
          );

          throw err;
        }
      }

      // Set page checksum so that we know this page was stored successfully
      const { error: updatePageError } = await supabaseClient
        .from('nods_page')
        .update({ checksum })
        .filter('id', 'eq', page.id);

      if (updatePageError) {
        throw updatePageError;
      }
    } catch (err) {
      console.error(
        `Page '${path}' or one/multiple of its page sections failed to store properly. Page has been marked with null checksum to indicate that it needs to be re-generated.`
      );
      console.error(err);
    }
  }

  console.log('Embedding generation complete');
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  await generateEmbeddings();
}

main().catch((err) => console.error(err));
