import { $ } from 'bun';

async function main() {
  await $`rm -rf dist`;

  const optionalPackages = [
    'class-transformer',
    'class-validator',
    '@nestjs/microservices',
    '@nestjs/websockets',
    '@fastify/static',
    '@nestjs/platform-express',
    '@fastify/view',
  ];

  const nativePackages = ['sharp', 'argon2'];

  const result = await Bun.build({
    entrypoints: ['./src/main.ts'],
    outdir: './dist',
    target: 'bun',
    minify: {
      syntax: false,
      whitespace: true,
    },
    external: [
      ...nativePackages,
      ...optionalPackages.filter((pkg) => {
        try {
          require.resolve(pkg);
          return false;
        } catch {
          return true;
        }
      }),
    ],
    splitting: false,
  });

  if (!result.success) {
    console.error('Build failed:');
    for (const log of result.logs) {
      console.error(log);
    }
    process.exit(1);
  }

  console.log('Built successfully!');
}

main().catch((err) => {
  console.error('Error during build:', err);
  process.exit(1);
});
