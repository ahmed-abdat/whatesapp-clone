import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function ShadcnTest() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 bg-whatsapp-bg min-h-screen">
      {/* Main Demo Card */}
      <Card className="shadow-lg border-whatsapp-primary/20">
        <CardHeader className="bg-gradient-to-r from-whatsapp-primary to-whatsapp-primary-dark text-white">
          <CardTitle className="text-xl">WhatsApp Clone UI Integration</CardTitle>
          <CardDescription className="text-white/90">
            Testing Shadcn UI components with Tailwind CSS v3 & WhatsApp brand colors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {/* Button Variations */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-color">Button Components</h3>
            <div className="flex flex-wrap gap-3">
              <Button className="bg-whatsapp-primary hover:bg-whatsapp-primary-dark">
                WhatsApp Primary
              </Button>
              <Button variant="secondary" className="bg-whatsapp-bg text-text-color">
                Secondary Style
              </Button>
              <Button variant="outline" className="border-whatsapp-primary text-whatsapp-primary hover:bg-whatsapp-primary hover:text-white">
                Outline Style
              </Button>
              <Button variant="destructive">
                Delete Message
              </Button>
            </div>
          </div>

          {/* Input Components */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-color">Input Components</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Input 
                placeholder="Type a message..." 
                className="border-color-gray focus:border-whatsapp-primary"
              />
              <Input 
                placeholder="Search contacts..." 
                className="border-color-gray focus:border-whatsapp-primary"
              />
            </div>
          </div>

          {/* Chat-like Interface Demo */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-color">Chat Interface Preview</h3>
            <div className="bg-whatsapp-chat-bg p-4 rounded-lg space-y-3 max-h-60 overflow-y-auto">
              <div className="flex justify-end">
                <div className="bg-whatsapp-primary text-white px-4 py-2 rounded-lg max-w-xs shadow-sm">
                  <p className="text-sm">This is a sent message with WhatsApp styling! 💬</p>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-white px-4 py-2 rounded-lg max-w-xs shadow-sm border">
                  <p className="text-sm text-text-color">This is a received message using our color system.</p>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-whatsapp-primary-dark text-white px-4 py-2 rounded-lg max-w-xs shadow-sm">
                  <p className="text-sm">Darker variant for emphasis!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dialog Demo */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-color">Modal Dialog</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-whatsapp-primary text-whatsapp-primary hover:bg-whatsapp-primary hover:text-white">
                  Open Settings
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-whatsapp-primary-darker">User Settings</DialogTitle>
                  <DialogDescription>
                    Configure your WhatsApp clone preferences below.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Input 
                    placeholder="Display name..." 
                    className="border-color-gray focus:border-whatsapp-primary"
                  />
                  <Input 
                    placeholder="Status message..." 
                    className="border-color-gray focus:border-whatsapp-primary"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline">Cancel</Button>
                    <Button className="bg-whatsapp-primary hover:bg-whatsapp-primary-dark">
                      Save Changes
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Color Palette Demo */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-text-color">WhatsApp Brand Colors</CardTitle>
          <CardDescription>
            Available color variables for consistent theming
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-whatsapp-primary rounded-lg mx-auto shadow-sm"></div>
              <p className="text-xs text-text-color-light">Primary</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-whatsapp-primary-dark rounded-lg mx-auto shadow-sm"></div>
              <p className="text-xs text-text-color-light">Primary Dark</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-whatsapp-primary-darker rounded-lg mx-auto shadow-sm"></div>
              <p className="text-xs text-text-color-light">Primary Darker</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-whatsapp-bg rounded-lg mx-auto shadow-sm border"></div>
              <p className="text-xs text-text-color-light">Background</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-whatsapp-chat-bg rounded-lg mx-auto shadow-sm"></div>
              <p className="text-xs text-text-color-light">Chat BG</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-whatsapp-chat-bg-deeper rounded-lg mx-auto shadow-sm"></div>
              <p className="text-xs text-text-color-light">Chat BG Deep</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}