import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Plus, 
  Trophy, 
  Crown, 
  Shield, 
  Copy, 
  RefreshCw,
  UserPlus,
  LogOut,
  Flame,
  Award,
  BookOpen,
  Star
} from "lucide-react";

export default function Teams() {
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [leaderboardCategory, setLeaderboardCategory] = useState<'streak' | 'badges' | 'courses' | 'points'>('points');

  // Form states
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDescription, setNewTeamDescription] = useState("");
  const [joinCode, setJoinCode] = useState("");

  // Queries
  const { data: myTeams, isLoading: teamsLoading, refetch: refetchTeams } = trpc.teams.getMyTeams.useQuery();

  const { data: publicTeams } = trpc.teams.getPublicTeams.useQuery({ limit: 10 });

  const { data: teamLeaderboard, isLoading: leaderboardLoading } = trpc.teams.getLeaderboard.useQuery(
    { teamId: selectedTeam!, category: leaderboardCategory },
    { enabled: !!selectedTeam }
  );

  const { data: teamMembers } = trpc.teams.getMembers.useQuery(
    { teamId: selectedTeam! },
    { enabled: !!selectedTeam }
  );

  const { data: selectedTeamData } = trpc.teams.get.useQuery(
    { teamId: selectedTeam! },
    { enabled: !!selectedTeam }
  );

  // Mutations
  const createTeamMutation = trpc.teams.create.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Team created!",
        description: `Your team has been created. Invite code: ${data.inviteCode}`,
      });
      setCreateDialogOpen(false);
      setNewTeamName("");
      setNewTeamDescription("");
      refetchTeams();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const joinTeamMutation = trpc.teams.joinByCode.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Joined team!",
        description: `You've joined ${data.teamName}`,
      });
      setJoinDialogOpen(false);
      setJoinCode("");
      refetchTeams();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const leaveTeamMutation = trpc.teams.leave.useMutation({
    onSuccess: () => {
      toast({
        title: "Left team",
        description: "You have left the team",
      });
      setSelectedTeam(null);
      refetchTeams();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const regenerateCodeMutation = trpc.teams.regenerateInviteCode.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Code regenerated",
        description: `New invite code: ${data.inviteCode}`,
      });
      refetchTeams();
    },
  });

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied!",
      description: "Invite code copied to clipboard",
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'streak': return <Flame className="h-4 w-4" />;
      case 'badges': return <Award className="h-4 w-4" />;
      case 'courses': return <BookOpen className="h-4 w-4" />;
      case 'points': return <Star className="h-4 w-4" />;
      default: return <Trophy className="h-4 w-4" />;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'admin': return <Shield className="h-4 w-4 text-blue-500" />;
      default: return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Teams</h1>
            <p className="text-muted-foreground mt-1">
              Create or join teams for friendly competition and private leaderboards
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Join Team
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Join a Team</DialogTitle>
                  <DialogDescription>
                    Enter the invite code shared by your team admin
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="inviteCode">Invite Code</Label>
                    <Input
                      id="inviteCode"
                      placeholder="Enter 8-character code"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      maxLength={8}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={() => joinTeamMutation.mutate({ inviteCode: joinCode })}
                    disabled={joinCode.length < 8 || joinTeamMutation.isPending}
                  >
                    {joinTeamMutation.isPending ? "Joining..." : "Join Team"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Team
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create a New Team</DialogTitle>
                  <DialogDescription>
                    Set up a private leaderboard for your organization or study group
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="teamName">Team Name</Label>
                    <Input
                      id="teamName"
                      placeholder="e.g., AI Safety Study Group"
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="teamDescription">Description (optional)</Label>
                    <Textarea
                      id="teamDescription"
                      placeholder="What's your team about?"
                      value={newTeamDescription}
                      onChange={(e) => setNewTeamDescription(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={() => createTeamMutation.mutate({
                      name: newTeamName,
                      description: newTeamDescription,
                    })}
                    disabled={!newTeamName || createTeamMutation.isPending}
                  >
                    {createTeamMutation.isPending ? "Creating..." : "Create Team"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* My Teams List */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  My Teams
                </CardTitle>
                <CardDescription>
                  Teams you're a member of
                </CardDescription>
              </CardHeader>
              <CardContent>
                {teamsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : myTeams && myTeams.length > 0 ? (
                  <div className="space-y-2">
                    {myTeams.map((team: any) => (
                      <button
                        key={team.id}
                        onClick={() => setSelectedTeam(team.id)}
                        className={`w-full p-3 rounded-lg border text-left transition-colors ${
                          selectedTeam === team.id
                            ? 'bg-primary/10 border-primary'
                            : 'hover:bg-muted/50 border-border'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getRoleIcon(team.role)}
                            <span className="font-medium">{team.name}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {team.memberCount} members
                          </Badge>
                        </div>
                        {team.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                            {team.description}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">You haven't joined any teams yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Create a team or join one with an invite code
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Public Teams */}
            {publicTeams && publicTeams.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Discover Public Teams</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {publicTeams.slice(0, 5).map((team: any) => (
                      <div
                        key={team.id}
                        className="p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{team.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {team.memberCount} members
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Team Details & Leaderboard */}
          <div className="lg:col-span-2">
            {selectedTeam && selectedTeamData ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {selectedTeamData.name}
                        {selectedTeamData.userRole && getRoleIcon(selectedTeamData.userRole)}
                      </CardTitle>
                      <CardDescription>
                        {selectedTeamData.description || 'No description'}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedTeamData.userRole === 'owner' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyInviteCode(selectedTeamData.inviteCode)}
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            {selectedTeamData.inviteCode}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => regenerateCodeMutation.mutate({ teamId: selectedTeam })}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {selectedTeamData.userRole !== 'owner' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => leaveTeamMutation.mutate({ teamId: selectedTeam })}
                        >
                          <LogOut className="h-4 w-4 mr-1" />
                          Leave
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="leaderboard">
                    <TabsList className="mb-4">
                      <TabsTrigger value="leaderboard">
                        <Trophy className="h-4 w-4 mr-2" />
                        Leaderboard
                      </TabsTrigger>
                      <TabsTrigger value="members">
                        <Users className="h-4 w-4 mr-2" />
                        Members
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="leaderboard" className="space-y-4">
                      {/* Category selector */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Sort by:</span>
                        <Select
                          value={leaderboardCategory}
                          onValueChange={(v) => setLeaderboardCategory(v as any)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="points">
                              <div className="flex items-center gap-2">
                                <Star className="h-4 w-4" />
                                Total Points
                              </div>
                            </SelectItem>
                            <SelectItem value="streak">
                              <div className="flex items-center gap-2">
                                <Flame className="h-4 w-4" />
                                Streak
                              </div>
                            </SelectItem>
                            <SelectItem value="badges">
                              <div className="flex items-center gap-2">
                                <Award className="h-4 w-4" />
                                Badges
                              </div>
                            </SelectItem>
                            <SelectItem value="courses">
                              <div className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4" />
                                Courses
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Leaderboard entries */}
                      {leaderboardLoading ? (
                        <div className="text-center py-8 text-muted-foreground">Loading...</div>
                      ) : teamLeaderboard?.entries && teamLeaderboard.entries.length > 0 ? (
                        <div className="space-y-2">
                          {teamLeaderboard.entries.map((entry: any, index: number) => (
                            <div
                              key={entry.userId}
                              className={`flex items-center gap-4 p-3 rounded-lg ${
                                entry.isCurrentUser
                                  ? 'bg-primary/10 border border-primary'
                                  : 'bg-muted/30'
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                index === 0 ? 'bg-yellow-500 text-white' :
                                index === 1 ? 'bg-gray-400 text-white' :
                                index === 2 ? 'bg-amber-600 text-white' :
                                'bg-muted text-muted-foreground'
                              }`}>
                                {entry.rank}
                              </div>
                              <Avatar className="h-10 w-10">
                                <AvatarFallback>
                                  {entry.userName.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{entry.userName}</span>
                                  {entry.role && getRoleIcon(entry.role)}
                                  {entry.isCurrentUser && (
                                    <Badge variant="secondary" className="text-xs">You</Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-lg font-semibold">
                                {getCategoryIcon(leaderboardCategory)}
                                {entry.score}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          No leaderboard data yet
                        </div>
                      )}

                      {teamLeaderboard?.totalMembers && (
                        <p className="text-sm text-muted-foreground text-center">
                          Showing top {teamLeaderboard.entries.length} of {teamLeaderboard.totalMembers} members
                        </p>
                      )}
                    </TabsContent>

                    <TabsContent value="members">
                      {teamMembers && teamMembers.length > 0 ? (
                        <div className="space-y-2">
                          {teamMembers.map((member: any) => (
                            <div
                              key={member.id}
                              className="flex items-center gap-4 p-3 rounded-lg bg-muted/30"
                            >
                              <Avatar className="h-10 w-10">
                                <AvatarFallback>
                                  {member.userName?.charAt(0).toUpperCase() || '?'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{member.userName}</span>
                                  {getRoleIcon(member.role)}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Joined {new Date(member.joinedAt).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge variant="outline" className="capitalize">
                                {member.role}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          No members found
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-16">
                  <div className="text-center">
                    <Trophy className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      Select a Team
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Choose a team from the list to view its leaderboard and compete with your teammates
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
