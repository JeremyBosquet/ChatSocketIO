#include "Warlock.hpp"

Warlock::Warlock(std::string const &name, std::string const &title)
{
    this->name = name;
    this->title = title;
    std::cout << this->name <<": This looks like another boring day.\n"; 
}

Warlock::~Warlock()
{
    std::cout << this->name <<": My job here is done!\n";
    std::map<std::string, ASpell *>::iterator it_begin = this->list.begin();
    std::map<std::string, ASpell *>::iterator it_end = this->list.end();
    while (it_begin != it_end)
    {
        delete it_begin->second;
        ++it_begin;
    }
    this->list.clear();
}

void Warlock::introduce(void) const
{
    std::cout << this->name <<": I am " << this->name << ", " << this->title <<"!\n";
}

std::string const &Warlock::getTitle(void) const
{
    return (this->title);
}

std::string const &Warlock::getName(void) const
{
    return (this->name);
}

void    Warlock::setTitle(std::string const &title)
{
    this->title = title;
}

void    Warlock::learnSpell(ASpell *other)
{
    if (other)
        this->list.insert(std::pair<std::string, ASpell *>(other->getName(), other->clone()));
}

void    Warlock::forgetSpell(std::string const &name)
{
    std::map<std::string, ASpell *>::iterator it = this->list.find(name);
    if (it != this->list.begin())
        delete it->second;
    this->list.erase(name);
}

void    Warlock::launchSpell(std::string const &name, ATarget &other)
{
    ASpell *temp = this->list[name];
    if (temp)
        temp->launch(other);
}