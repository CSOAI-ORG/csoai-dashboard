import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Upload,
  Save,
  Eye,
  Download,
  Image as ImageIcon,
  FileSignature,
  Palette,
  Layout,
} from "lucide-react";
import { toast } from "sonner";

const FRAMEWORK_NAMES: Record<string, string> = {
  "eu-ai-act": "EU AI Act",
  "nist-ai-rmf": "NIST AI RMF",
  "tc260": "TC260",
  "iso-42001": "ISO 42001",
  "uk-ai-assurance": "UK AI Assurance",
  "singapore-feat": "Singapore FEAT",
  "japan-social-principles": "Japan Social Principles",
};

interface CertificateTemplate {
  framework: string;
  logo?: {
    url: string;
    x: number;
    y: number;
    width: number;
    height: number;
  };
  signature?: {
    url: string;
    x: number;
    y: number;
    width: number;
    height: number;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
  };
  fonts: {
    title: string;
    body: string;
  };
  layout: {
    borderWidth: number;
    borderStyle: string;
    padding: number;
  };
}

const DEFAULT_TEMPLATE: CertificateTemplate = {
  framework: "eu-ai-act",
  colors: {
    primary: "#3b82f6",
    secondary: "#10b981",
    accent: "#f59e0b",
    text: "#1f2937",
    background: "#ffffff",
  },
  fonts: {
    title: "Georgia, serif",
    body: "Arial, sans-serif",
  },
  layout: {
    borderWidth: 8,
    borderStyle: "double",
    padding: 40,
  },
};

export default function CertificateDesigner() {
  const [template, setTemplate] = useState<CertificateTemplate>(DEFAULT_TEMPLATE);
  const [selectedFramework, setSelectedFramework] = useState("eu-ai-act");
  const logoInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setTemplate({
          ...template,
          logo: {
            url: e.target?.result as string,
            x: 50,
            y: 50,
            width: 150,
            height: 150,
          },
        });
        toast.success("Logo uploaded successfully");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setTemplate({
          ...template,
          signature: {
            url: e.target?.result as string,
            x: 600,
            y: 700,
            width: 200,
            height: 80,
          },
        });
        toast.success("Signature uploaded successfully");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveTemplate = () => {
    // In a real implementation, this would save to the backend
    console.log("Saving template:", template);
    toast.success("Certificate template saved successfully");
  };

  const handleExportTemplate = () => {
    const json = JSON.stringify(template, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `certificate-template-${template.framework}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Template exported successfully");
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Certificate Designer</h1>
          <p className="text-muted-foreground mt-1">
            Customize certificate templates with logos, signatures, and framework-specific branding
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportTemplate}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleSaveTemplate}>
            <Save className="w-4 h-4 mr-2" />
            Save Template
          </Button>
        </div>
      </div>

      {/* Framework Selector */}
      <Card className="p-6">
        <Label>Select Framework</Label>
        <Select
          value={selectedFramework}
          onValueChange={(value) => {
            setSelectedFramework(value);
            setTemplate({ ...template, framework: value });
          }}
        >
          <SelectTrigger className="mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(FRAMEWORK_NAMES).map(([key, name]) => (
              <SelectItem key={key} value={key}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customization Panel */}
        <div className="space-y-6">
          <Tabs defaultValue="assets" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="assets">
                <ImageIcon className="w-4 h-4 mr-2" />
                Assets
              </TabsTrigger>
              <TabsTrigger value="colors">
                <Palette className="w-4 h-4 mr-2" />
                Colors
              </TabsTrigger>
              <TabsTrigger value="fonts">
                <FileSignature className="w-4 h-4 mr-2" />
                Fonts
              </TabsTrigger>
              <TabsTrigger value="layout">
                <Layout className="w-4 h-4 mr-2" />
                Layout
              </TabsTrigger>
            </TabsList>

            {/* Assets Tab */}
            <TabsContent value="assets" className="space-y-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Logo</h3>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => logoInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Logo
                </Button>

                {template.logo && (
                  <div className="mt-4 space-y-4">
                    <div className="space-y-2">
                      <Label>X Position: {template.logo.x}px</Label>
                      <Slider
                        value={[template.logo.x]}
                        onValueChange={([x]) =>
                          setTemplate({
                            ...template,
                            logo: { ...template.logo!, x },
                          })
                        }
                        min={0}
                        max={800}
                        step={10}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Y Position: {template.logo.y}px</Label>
                      <Slider
                        value={[template.logo.y]}
                        onValueChange={([y]) =>
                          setTemplate({
                            ...template,
                            logo: { ...template.logo!, y },
                          })
                        }
                        min={0}
                        max={1000}
                        step={10}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Width: {template.logo.width}px</Label>
                      <Slider
                        value={[template.logo.width]}
                        onValueChange={([width]) =>
                          setTemplate({
                            ...template,
                            logo: { ...template.logo!, width },
                          })
                        }
                        min={50}
                        max={400}
                        step={10}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Height: {template.logo.height}px</Label>
                      <Slider
                        value={[template.logo.height]}
                        onValueChange={([height]) =>
                          setTemplate({
                            ...template,
                            logo: { ...template.logo!, height },
                          })
                        }
                        min={50}
                        max={400}
                        step={10}
                      />
                    </div>
                  </div>
                )}
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Signature</h3>
                <input
                  ref={signatureInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleSignatureUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => signatureInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Signature
                </Button>

                {template.signature && (
                  <div className="mt-4 space-y-4">
                    <div className="space-y-2">
                      <Label>X Position: {template.signature.x}px</Label>
                      <Slider
                        value={[template.signature.x]}
                        onValueChange={([x]) =>
                          setTemplate({
                            ...template,
                            signature: { ...template.signature!, x },
                          })
                        }
                        min={0}
                        max={800}
                        step={10}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Y Position: {template.signature.y}px</Label>
                      <Slider
                        value={[template.signature.y]}
                        onValueChange={([y]) =>
                          setTemplate({
                            ...template,
                            signature: { ...template.signature!, y },
                          })
                        }
                        min={0}
                        max={1000}
                        step={10}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Width: {template.signature.width}px</Label>
                      <Slider
                        value={[template.signature.width]}
                        onValueChange={([width]) =>
                          setTemplate({
                            ...template,
                            signature: { ...template.signature!, width },
                          })
                        }
                        min={100}
                        max={400}
                        step={10}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Height: {template.signature.height}px</Label>
                      <Slider
                        value={[template.signature.height]}
                        onValueChange={([height]) =>
                          setTemplate({
                            ...template,
                            signature: { ...template.signature!, height },
                          })
                        }
                        min={40}
                        max={200}
                        step={10}
                      />
                    </div>
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* Colors Tab */}
            <TabsContent value="colors" className="space-y-4">
              <Card className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={template.colors.primary}
                      onChange={(e) =>
                        setTemplate({
                          ...template,
                          colors: { ...template.colors, primary: e.target.value },
                        })
                      }
                      className="w-20 h-10"
                    />
                    <Input
                      value={template.colors.primary}
                      onChange={(e) =>
                        setTemplate({
                          ...template,
                          colors: { ...template.colors, primary: e.target.value },
                        })
                      }
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={template.colors.secondary}
                      onChange={(e) =>
                        setTemplate({
                          ...template,
                          colors: { ...template.colors, secondary: e.target.value },
                        })
                      }
                      className="w-20 h-10"
                    />
                    <Input
                      value={template.colors.secondary}
                      onChange={(e) =>
                        setTemplate({
                          ...template,
                          colors: { ...template.colors, secondary: e.target.value },
                        })
                      }
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Accent Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={template.colors.accent}
                      onChange={(e) =>
                        setTemplate({
                          ...template,
                          colors: { ...template.colors, accent: e.target.value },
                        })
                      }
                      className="w-20 h-10"
                    />
                    <Input
                      value={template.colors.accent}
                      onChange={(e) =>
                        setTemplate({
                          ...template,
                          colors: { ...template.colors, accent: e.target.value },
                        })
                      }
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Text Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={template.colors.text}
                      onChange={(e) =>
                        setTemplate({
                          ...template,
                          colors: { ...template.colors, text: e.target.value },
                        })
                      }
                      className="w-20 h-10"
                    />
                    <Input
                      value={template.colors.text}
                      onChange={(e) =>
                        setTemplate({
                          ...template,
                          colors: { ...template.colors, text: e.target.value },
                        })
                      }
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Background Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={template.colors.background}
                      onChange={(e) =>
                        setTemplate({
                          ...template,
                          colors: { ...template.colors, background: e.target.value },
                        })
                      }
                      className="w-20 h-10"
                    />
                    <Input
                      value={template.colors.background}
                      onChange={(e) =>
                        setTemplate({
                          ...template,
                          colors: { ...template.colors, background: e.target.value },
                        })
                      }
                      className="flex-1"
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Fonts Tab */}
            <TabsContent value="fonts" className="space-y-4">
              <Card className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label>Title Font</Label>
                  <Select
                    value={template.fonts.title}
                    onValueChange={(value) =>
                      setTemplate({
                        ...template,
                        fonts: { ...template.fonts, title: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Georgia, serif">Georgia</SelectItem>
                      <SelectItem value="Times New Roman, serif">Times New Roman</SelectItem>
                      <SelectItem value="Playfair Display, serif">Playfair Display</SelectItem>
                      <SelectItem value="Merriweather, serif">Merriweather</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Body Font</Label>
                  <Select
                    value={template.fonts.body}
                    onValueChange={(value) =>
                      setTemplate({
                        ...template,
                        fonts: { ...template.fonts, body: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                      <SelectItem value="Helvetica, sans-serif">Helvetica</SelectItem>
                      <SelectItem value="Open Sans, sans-serif">Open Sans</SelectItem>
                      <SelectItem value="Roboto, sans-serif">Roboto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </Card>
            </TabsContent>

            {/* Layout Tab */}
            <TabsContent value="layout" className="space-y-4">
              <Card className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label>Border Width: {template.layout.borderWidth}px</Label>
                  <Slider
                    value={[template.layout.borderWidth]}
                    onValueChange={([borderWidth]) =>
                      setTemplate({
                        ...template,
                        layout: { ...template.layout, borderWidth },
                      })
                    }
                    min={0}
                    max={20}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Border Style</Label>
                  <Select
                    value={template.layout.borderStyle}
                    onValueChange={(borderStyle) =>
                      setTemplate({
                        ...template,
                        layout: { ...template.layout, borderStyle },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solid">Solid</SelectItem>
                      <SelectItem value="double">Double</SelectItem>
                      <SelectItem value="dashed">Dashed</SelectItem>
                      <SelectItem value="dotted">Dotted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Padding: {template.layout.padding}px</Label>
                  <Slider
                    value={[template.layout.padding]}
                    onValueChange={([padding]) =>
                      setTemplate({
                        ...template,
                        layout: { ...template.layout, padding },
                      })
                    }
                    min={20}
                    max={80}
                    step={5}
                  />
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Live Preview */}
        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Live Preview
              </h2>
            </div>

            {/* Certificate Preview */}
            <div
              className="relative w-full aspect-[8.5/11] shadow-lg"
              style={{
                backgroundColor: template.colors.background,
                border: `${template.layout.borderWidth}px ${template.layout.borderStyle} ${template.colors.primary}`,
                padding: `${template.layout.padding}px`,
              }}
            >
              {/* Logo */}
              {template.logo && (
                <img
                  src={template.logo.url}
                  alt="Logo"
                  style={{
                    position: "absolute",
                    left: `${template.logo.x}px`,
                    top: `${template.logo.y}px`,
                    width: `${template.logo.width}px`,
                    height: `${template.logo.height}px`,
                    objectFit: "contain",
                  }}
                />
              )}

              {/* Certificate Content */}
              <div className="flex flex-col items-center justify-center h-full text-center">
                <h1
                  className="text-4xl font-bold mb-4"
                  style={{
                    fontFamily: template.fonts.title,
                    color: template.colors.primary,
                  }}
                >
                  Certificate of Completion
                </h1>

                <p
                  className="text-xl mb-6"
                  style={{
                    fontFamily: template.fonts.body,
                    color: template.colors.text,
                  }}
                >
                  This is to certify that
                </p>

                <h2
                  className="text-3xl font-bold mb-6"
                  style={{
                    fontFamily: template.fonts.title,
                    color: template.colors.secondary,
                  }}
                >
                  John Doe
                </h2>

                <p
                  className="text-lg mb-4"
                  style={{
                    fontFamily: template.fonts.body,
                    color: template.colors.text,
                  }}
                >
                  has successfully completed the
                </p>

                <h3
                  className="text-2xl font-semibold mb-8"
                  style={{
                    fontFamily: template.fonts.title,
                    color: template.colors.accent,
                  }}
                >
                  {FRAMEWORK_NAMES[template.framework]} Certification
                </h3>

                <p
                  className="text-sm"
                  style={{
                    fontFamily: template.fonts.body,
                    color: template.colors.text,
                  }}
                >
                  Certificate No: CERT-2024-001
                  <br />
                  Issued on: {new Date().toLocaleDateString()}
                </p>
              </div>

              {/* Signature */}
              {template.signature && (
                <img
                  src={template.signature.url}
                  alt="Signature"
                  style={{
                    position: "absolute",
                    left: `${template.signature.x}px`,
                    top: `${template.signature.y}px`,
                    width: `${template.signature.width}px`,
                    height: `${template.signature.height}px`,
                    objectFit: "contain",
                  }}
                />
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
