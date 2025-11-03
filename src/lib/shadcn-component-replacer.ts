/**
 * Substituidor de Componentes Shadcn/ui para HTML Estático
 * 
 * Como os componentes Shadcn/ui são React components complexos,
 * este módulo substitui componentes Shadcn por HTML estático equivalente.
 */

interface ComponentReplacement {
  pattern: RegExp;
  replacement: (match: string, attrs: string | undefined) => string;
}

const componentReplacements: ComponentReplacement[] = [
  // Button
  {
    pattern: /<Button([^>]*?)>(.*?)<\/Button>/gis,
    replacement: (match, attrs, content) => {
      // Extrair variantes e classes
      const variantMatch = attrs?.match(/variant\s*=\s*["'](\w+)["']/);
      const variant = variantMatch ? variantMatch[1] : 'default';
      const classNameMatch = attrs?.match(/className\s*=\s*["']([^"']+)["']/);
      const existingClasses = classNameMatch ? classNameMatch[1] : '';
      
      // Mapear variantes para classes Tailwind
      const variantClasses: Record<string, string> = {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline'
      };
      
      const variantClass = variantClasses[variant] || variantClasses.default;
      
      return `<button class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 ${variantClass} ${existingClasses}">${content}</button>`;
    }
  },
  
  // Card
  {
    pattern: /<Card([^>]*?)>(.*?)<\/Card>/gis,
    replacement: (match, attrs, content) => {
      const classNameMatch = attrs?.match(/className\s*=\s*["']([^"']+)["']/);
      const existingClasses = classNameMatch ? classNameMatch[1] : '';
      return `<div class="rounded-lg border bg-card text-card-foreground shadow-sm ${existingClasses}">${content}</div>`;
    }
  },
  
  // CardHeader
  {
    pattern: /<CardHeader([^>]*?)>(.*?)<\/CardHeader>/gis,
    replacement: (match, attrs, content) => {
      const classNameMatch = attrs?.match(/className\s*=\s*["']([^"']+)["']/);
      const existingClasses = classNameMatch ? classNameMatch[1] : '';
      return `<div class="flex flex-col space-y-1.5 p-6 ${existingClasses}">${content}</div>`;
    }
  },
  
  // CardTitle
  {
    pattern: /<CardTitle([^>]*?)>(.*?)<\/CardTitle>/gis,
    replacement: (match, attrs, content) => {
      const classNameMatch = attrs?.match(/className\s*=\s*["']([^"']+)["']/);
      const existingClasses = classNameMatch ? classNameMatch[1] : '';
      return `<h3 class="text-2xl font-semibold leading-none tracking-tight ${existingClasses}">${content}</h3>`;
    }
  },
  
  // CardDescription
  {
    pattern: /<CardDescription([^>]*?)>(.*?)<\/CardDescription>/gis,
    replacement: (match, attrs, content) => {
      const classNameMatch = attrs?.match(/className\s*=\s*["']([^"']+)["']/);
      const existingClasses = classNameMatch ? classNameMatch[1] : '';
      return `<p class="text-sm text-muted-foreground ${existingClasses}">${content}</p>`;
    }
  },
  
  // CardContent
  {
    pattern: /<CardContent([^>]*?)>(.*?)<\/CardContent>/gis,
    replacement: (match, attrs, content) => {
      const classNameMatch = attrs?.match(/className\s*=\s*["']([^"']+)["']/);
      const existingClasses = classNameMatch ? classNameMatch[1] : '';
      return `<div class="p-6 pt-0 ${existingClasses}">${content}</div>`;
    }
  },
  
  // CardFooter
  {
    pattern: /<CardFooter([^>]*?)>(.*?)<\/CardFooter>/gis,
    replacement: (match, attrs, content) => {
      const classNameMatch = attrs?.match(/className\s*=\s*["']([^"']+)["']/);
      const existingClasses = classNameMatch ? classNameMatch[1] : '';
      return `<div class="flex items-center p-6 pt-0 ${existingClasses}">${content}</div>`;
    }
  },
  
  // Badge
  {
    pattern: /<Badge([^>]*?)>(.*?)<\/Badge>/gis,
    replacement: (match, attrs, content) => {
      const variantMatch = attrs?.match(/variant\s*=\s*["'](\w+)["']/);
      const variant = variantMatch ? variantMatch[1] : 'default';
      const classNameMatch = attrs?.match(/className\s*=\s*["']([^"']+)["']/);
      const existingClasses = classNameMatch ? classNameMatch[1] : '';
      
      const variantClasses: Record<string, string> = {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground'
      };
      
      const variantClass = variantClasses[variant] || variantClasses.default;
      
      return `<span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variantClass} ${existingClasses}">${content}</span>`;
    }
  },
  
  // Input
  {
    pattern: /<Input([^>]*?)\/?>/gis,
    replacement: (match, attrs) => {
      const typeMatch = attrs?.match(/type\s*=\s*["'](\w+)["']/);
      const type = typeMatch ? typeMatch[1] : 'text';
      const classNameMatch = attrs?.match(/className\s*=\s*["']([^"']+)["']/);
      const existingClasses = classNameMatch ? classNameMatch[1] : '';
      const placeholderMatch = attrs?.match(/placeholder\s*=\s*["']([^"']+)["']/);
      const placeholder = placeholderMatch ? placeholderMatch[1] : '';
      const nameMatch = attrs?.match(/name\s*=\s*["'](\w+)["']/);
      const name = nameMatch ? nameMatch[1] : '';
      
      return `<input type="${type}" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${existingClasses}" ${placeholder ? `placeholder="${placeholder}"` : ''} ${name ? `name="${name}"` : ''} />`;
    }
  },
  
  // Textarea
  {
    pattern: /<Textarea([^>]*?)>(.*?)<\/Textarea>/gis,
    replacement: (match, attrs, content) => {
      const classNameMatch = attrs?.match(/className\s*=\s*["']([^"']+)["']/);
      const existingClasses = classNameMatch ? classNameMatch[1] : '';
      const placeholderMatch = attrs?.match(/placeholder\s*=\s*["']([^"']+)["']/);
      const placeholder = placeholderMatch ? placeholderMatch[1] : '';
      const nameMatch = attrs?.match(/name\s*=\s*["'](\w+)["']/);
      const name = nameMatch ? nameMatch[1] : '';
      
      return `<textarea class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${existingClasses}" ${placeholder ? `placeholder="${placeholder}"` : ''} ${name ? `name="${name}"` : ''}>${content}</textarea>`;
    }
  },
  
  // Label
  {
    pattern: /<Label([^>]*?)>(.*?)<\/Label>/gis,
    replacement: (match, attrs, content) => {
      const classNameMatch = attrs?.match(/className\s*=\s*["']([^"']+)["']/);
      const existingClasses = classNameMatch ? classNameMatch[1] : '';
      const htmlForMatch = attrs?.match(/htmlFor\s*=\s*["'](\w+)["']/);
      const htmlFor = htmlForMatch ? htmlForMatch[1] : '';
      
      return `<label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${existingClasses}" ${htmlFor ? `for="${htmlFor}"` : ''}>${content}</label>`;
    }
  },
  
  // Accordion
  {
    pattern: /<Accordion([^>]*?)>(.*?)<\/Accordion>/gis,
    replacement: (match, attrs, content) => {
      const classNameMatch = attrs?.match(/className\s*=\s*["']([^"']+)["']/);
      const existingClasses = classNameMatch ? classNameMatch[1] : '';
      // Accordion é um container - substituir por div
      return `<div class="w-full ${existingClasses}">${content}</div>`;
    }
  },
  
  // AccordionItem
  {
    pattern: /<AccordionItem([^>]*?)>(.*?)<\/AccordionItem>/gis,
    replacement: (match, attrs, content) => {
      const classNameMatch = attrs?.match(/className\s*=\s*["']([^"']+)["']/);
      const existingClasses = classNameMatch ? classNameMatch[1] : '';
      const valueMatch = attrs?.match(/value\s*=\s*["'](\w+)["']/);
      const value = valueMatch ? valueMatch[1] : '';
      
      return `<div class="border-b ${existingClasses}" ${value ? `data-value="${value}"` : ''}>${content}</div>`;
    }
  },
  
  // AccordionTrigger
  {
    pattern: /<AccordionTrigger([^>]*?)>(.*?)<\/AccordionTrigger>/gis,
    replacement: (match, attrs, content) => {
      const classNameMatch = attrs?.match(/className\s*=\s*["']([^"']+)["']/);
      const existingClasses = classNameMatch ? classNameMatch[1] : '';
      // Adicionar chevron SVG
      return `<div class="flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline ${existingClasses}">
        ${content}
        <svg class="h-4 w-4 shrink-0 transition-transform duration-200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </div>`;
    }
  },
  
  // AccordionContent
  {
    pattern: /<AccordionContent([^>]*?)>(.*?)<\/AccordionContent>/gis,
    replacement: (match, attrs, content) => {
      const classNameMatch = attrs?.match(/className\s*=\s*["']([^"']+)["']/);
      const existingClasses = classNameMatch ? classNameMatch[1] : '';
      return `<div class="overflow-hidden text-sm transition-all pb-4 pt-0 ${existingClasses}">${content}</div>`;
    }
  }
];

/**
 * Substitui todos os componentes Shadcn/ui por HTML estático equivalente
 */
export function replaceShadcnComponents(html: string): string {
  let result = html;
  let changesCount = 0;
  
  // Aplicar todas as substituições
  for (const { pattern, replacement } of componentReplacements) {
    const matches = result.match(pattern);
    if (matches && matches.length > 0) {
      changesCount += matches.length;
      result = result.replace(pattern, replacement);
    }
  }
  
  if (changesCount > 0) {
    console.log(`✅ [shadcn-replacer] ${changesCount} componentes Shadcn substituídos por HTML estático`);
  }
  
  return result;
}

/**
 * Remove imports de componentes Shadcn que não são mais necessários
 */
export function removeShadcnImports(code: string): string {
  const importPatterns = [
    /import\s*\{[^}]*\}\s*from\s*["']@\/components\/ui\/card["'];?\s*\n?/g,
    /import\s*\{[^}]*\}\s*from\s*["']@\/components\/ui\/button["'];?\s*\n?/g,
    /import\s*\{[^}]*\}\s*from\s*["']@\/components\/ui\/badge["'];?\s*\n?/g,
    /import\s*\{[^}]*\}\s*from\s*["']@\/components\/ui\/input["'];?\s*\n?/g,
    /import\s*\{[^}]*\}\s*from\s*["']@\/components\/ui\/textarea["'];?\s*\n?/g,
    /import\s*\{[^}]*\}\s*from\s*["']@\/components\/ui\/label["'];?\s*\n?/g,
    /import\s*\{[^}]*\}\s*from\s*["']@\/components\/ui\/accordion["'];?\s*\n?/g,
  ];
  
  let result = code;
  for (const pattern of importPatterns) {
    result = result.replace(pattern, '');
  }
  
  return result;
}

